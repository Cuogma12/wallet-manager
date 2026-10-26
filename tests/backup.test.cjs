const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTypescript } = require('./helpers/loadTypescript.cjs');
const { createDatabase } = require('./helpers/sqlite.cjs');
const { migrateDbIfNeeded } = loadTypescript('src/db/database.ts');
const finance = loadTypescript('src/db/repositories/financeRepository.ts');
const backup = () => loadTypescript('src/db/repositories/backupRepository.ts');
const { parseBackup, parseBackupText } = loadTypescript(
  'src/shared/utils/backupValidation.ts',
);

async function fresh(t) {
  const db = createDatabase();
  t.after(() => db.raw.close());
  await migrateDbIfNeeded(db);
  return db;
}
const empty = () => ({
  format: 'monee-backup',
  version: 1,
  currency: 'VND',
  createdAt: '2026-01-01T00:00:00.000Z',
  accounts: [],
  transactions: [],
  settings: { initialBalance: 0, monthlyIncome: 0, salaryDay: 1 },
});

test('backup validation rejects unrecognized versions, noninteger money, dangling IDs and duplicates', () => {
  assert.deepEqual(parseBackup(empty()), empty());
  for (const value of [
    {},
    { ...empty(), version: 2 },
    { ...empty(), currency: 'USD' },
    {
      ...empty(),
      accounts: [
        {
          id: 'a',
          name: 'A',
          type: 'cash',
          balance: 0.5,
          openingBalance: 0,
          isDemo: false,
        },
      ],
    },
  ]) {
    assert.throws(() => parseBackup(value), { code: 'invalidBackup' });
  }
  assert.throws(() => parseBackupText('{not json'), { code: 'invalidBackup' });
  assert.throws(() => parseBackupText('x'.repeat(10 * 1024 * 1024 + 1)), {
    code: 'backupTooLarge',
  });
});

test('backup validation rejects dangling/duplicate transactions and strips untrusted identity fields', () => {
  const account = {
    id: 'a',
    name: 'A',
    type: 'cash',
    balance: 1000,
    openingBalance: 1000,
    isDemo: false,
  };
  const transaction = {
    id: 'tx',
    accountId: 'missing',
    title: 'Bad reference',
    merchant: '',
    amount: 100,
    type: 'expense',
    category: 'food',
    occurredAt: '2026-01-01T00:00:00.000Z',
    source: 'manual',
    isReviewed: true,
    isDemo: false,
  };
  assert.throws(
    () =>
      parseBackup({
        ...empty(),
        accounts: [account],
        transactions: [transaction],
      }),
    { code: 'invalidBackup' },
  );
  assert.throws(
    () => parseBackup({ ...empty(), accounts: [account, account] }),
    { code: 'invalidBackup' },
  );
  assert.throws(
    () =>
      parseBackup({
        ...empty(),
        accounts: [{ ...account, balance: 800 }],
        transactions: [
          { ...transaction, accountId: 'a' },
          { ...transaction, accountId: 'a' },
        ],
      }),
    { code: 'invalidBackup' },
  );
  const parsed = parseBackup({
    ...empty(),
    auth_user_id: 'must-not-restore',
    accounts: [{ ...account, profile_id: 'other' }],
  });
  assert.ok(!('auth_user_id' in parsed));
  assert.ok(!('profile_id' in parsed.accounts[0]));
});

test('portable backup preserves balances, salary baseline, notes, IDs and does not export identity', async (t) => {
  const db = await fresh(t);
  const accountId = await finance.saveAccount(db, {
    name: 'Ngân hàng',
    type: 'bank',
    balance: 20000000,
  });
  await finance.recordSalary(db, {
    accountId,
    title: 'Lương',
    amount: 18000000,
    month: '2025-12',
    receivedAt: '2026-01-01T05:00:00.000Z',
    includedInBalance: true,
  });
  await finance.addTransaction(db, {
    accountId,
    title: 'Ăn trưa',
    amount: 50000,
    type: 'expense',
    category: 'food',
    categoryIcon: '',
    occurredAt: '2026-01-01T06:00:00.000Z',
    note: 'Tiếng Việt',
  });
  const snapshot = await backup().exportBackup(db);
  assert.equal(snapshot.accounts[0].openingBalance, 2000000);
  assert.equal(snapshot.accounts[0].balance, 19950000);
  const text = JSON.stringify(snapshot);
  assert.ok(!text.includes('auth_user_id'));
  assert.ok(!text.includes('device_id'));
  const destination = await fresh(t);
  await backup().restoreBackup(destination, snapshot);
  const restored = await backup().exportBackup(destination);
  assert.deepEqual({ ...restored, createdAt: snapshot.createdAt }, snapshot);
  await migrateDbIfNeeded(destination);
  assert.equal((await finance.loadFinance(destination)).transactions.length, 2);
});

test('restore rejects a tampered balance before changing existing data', async (t) => {
  const db = await fresh(t);
  await finance.saveAccount(db, {
    name: 'Existing',
    type: 'cash',
    balance: 90000,
  });
  const original = await finance.loadFinance(db);
  const snapshot = await backup().exportBackup(db);
  snapshot.accounts[0].balance++;
  await assert.rejects(async () => backup().restoreBackup(db, snapshot), {
    code: 'invalidBackup',
  });
  assert.deepEqual(await finance.loadFinance(db), original);
});

test('restore failure rolls back deletion of the existing wallet and transactions', async (t) => {
  const db = await fresh(t);
  await finance.saveAccount(db, {
    name: 'Keep me',
    type: 'cash',
    balance: 90000,
  });
  const before = await finance.loadFinance(db);
  const original = db.runAsync;
  db.runAsync = async (sql, ...args) => {
    if (sql.startsWith('UPDATE settings'))
      throw new Error('Injected restore failure');
    return original(sql, ...args);
  };
  await assert.rejects(
    backup().restoreBackup(db, empty()),
    /Injected restore failure/,
  );
  db.runAsync = original;
  assert.deepEqual(await finance.loadFinance(db), before);
});

test('restoring the same backup twice replaces rather than duplicates financial records', async (t) => {
  const db = await fresh(t);
  await finance.saveAccount(db, { name: 'Cash', type: 'cash', balance: 1000 });
  const snapshot = await backup().exportBackup(db);
  await backup().restoreBackup(db, snapshot);
  await backup().restoreBackup(db, snapshot);
  assert.equal((await finance.loadFinance(db)).accounts.length, 1);
  assert.equal((await finance.loadFinance(db)).accounts[0].balance, 1000);
});

test('restore cannot replace a linked profile or collide with another profile IDs', async (t) => {
  const db = await fresh(t);
  await finance.saveAccount(db, { name: 'Cash', type: 'cash', balance: 1000 });
  const snapshot = await backup().exportBackup(db);
  db.raw.exec('UPDATE profiles SET sync_enabled = 1');
  await assert.rejects(backup().restoreBackup(db, snapshot), {
    code: 'restoreUnavailable',
  });
  db.raw.exec(
    "UPDATE profiles SET sync_enabled = 0; INSERT INTO profiles (id,device_id,created_at,updated_at) VALUES ('other','device','','')",
  );
  db.raw.prepare("UPDATE accounts SET profile_id = 'other'").run();
  await assert.rejects(backup().restoreBackup(db, snapshot), {
    code: 'restoreUnavailable',
  });
  assert.equal(
    db.raw.prepare('SELECT balance FROM accounts').get().balance,
    1000,
  );
});
