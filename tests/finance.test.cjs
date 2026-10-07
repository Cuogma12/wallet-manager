const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTypescript } = require('./helpers/loadTypescript.cjs');
const { createDatabase, seedLegacy } = require('./helpers/sqlite.cjs');
const { migrateDbIfNeeded } = loadTypescript('src/db/database.ts');
const repo = loadTypescript('src/db/repositories/financeRepository.ts');
const validation = loadTypescript('src/shared/utils/financeValidation.ts');

async function fresh(t) {
  const db = createDatabase();
  t.after(() => db.raw.close());
  await migrateDbIfNeeded(db);
  return db;
}

const expense = (accountId, amount = 50000) => ({
  accountId,
  title: 'Lunch',
  amount,
  type: 'expense',
  category: 'food',
  categoryIcon: 'food-outline',
  occurredAt: new Date().toISOString(),
});
const salary = (accountId, extra = {}) => ({
  accountId,
  title: 'Salary',
  amount: 18000000,
  month: validation.getMonthKey(),
  receivedAt: new Date().toISOString(),
  includedInBalance: false,
  ...extra,
});

test('fresh install has no demo and repeated initialization keeps user data', async (t) => {
  const db = await fresh(t);
  assert.equal((await repo.loadFinance(db)).accounts.length, 0);
  const id = await repo.saveAccount(db, {
    name: 'Cash',
    type: 'cash',
    balance: 0,
  });
  await migrateDbIfNeeded(db);
  assert.equal((await repo.loadFinance(db)).accounts[0].id, id);
  assert.equal(db.raw.prepare('PRAGMA user_version').get().user_version, 3);
  assert.equal(db.raw.prepare('PRAGMA foreign_keys').get().foreign_keys, 1);
});

test('editing current balance changes baseline without creating income', async (t) => {
  const db = await fresh(t);
  const id = await repo.saveAccount(db, {
    name: 'Cash',
    type: 'cash',
    balance: 100000,
  });
  await repo.addTransaction(db, expense(id));
  await repo.saveAccount(db, {
    id,
    name: 'Main',
    type: 'bank',
    balance: 200000,
  });
  assert.equal((await repo.loadFinance(db)).accounts[0].balance, 200000);
  assert.equal((await repo.loadFinance(db)).transactions.length, 1);
  assert.equal(
    db.raw.prepare('SELECT opening_balance FROM accounts WHERE id = ?').get(id)
      .opening_balance,
    250000,
  );
});

test('salary is atomic and duplicate taps cannot credit the same profile month twice', async (t) => {
  const db = await fresh(t);
  const id = await repo.saveAccount(db, {
    name: 'Bank',
    type: 'bank',
    balance: 100000,
  });
  const other = await repo.saveAccount(db, {
    name: 'Other',
    type: 'bank',
    balance: 0,
  });
  const results = await Promise.allSettled([
    repo.recordSalary(db, salary(id)),
    repo.recordSalary(db, salary(other)),
  ]);
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(
    results.find((r) => r.status === 'rejected').reason.code,
    'salaryExists',
  );
  const data = await repo.loadFinance(db);
  assert.equal(data.transactions.length, 1);
  assert.equal(
    data.accounts.reduce((sum, a) => sum + a.balance, 0),
    18100000,
  );
});

test('salary already included in balance is recorded without crediting again', async (t) => {
  const db = await fresh(t);
  const id = await repo.saveAccount(db, {
    name: 'Bank',
    type: 'bank',
    balance: 20000000,
  });
  await repo.recordSalary(db, salary(id, { includedInBalance: true }));
  assert.equal((await repo.loadFinance(db)).accounts[0].balance, 20000000);
  assert.equal(
    db.raw.prepare('SELECT opening_balance FROM accounts WHERE id = ?').get(id)
      .opening_balance,
    2000000,
  );
});

test('salary month is independent from receipt month; next month is allowed', async (t) => {
  const db = await fresh(t);
  const id = await repo.saveAccount(db, {
    name: 'Bank',
    type: 'bank',
    balance: 0,
  });
  await repo.recordSalary(db, salary(id, { month: '2025-12' }));
  await repo.recordSalary(db, salary(id, { month: '2026-01' }));
  assert.equal((await repo.loadFinance(db)).accounts[0].balance, 36000000);
});

for (const version of [1, 2])
  test(`upgrade v${version} preserves old records and supports new transactions`, async (t) => {
    const db = createDatabase();
    t.after(() => db.raw.close());
    seedLegacy(db, version);
    await migrateDbIfNeeded(db);
    assert.equal((await repo.loadFinance(db)).transactions.length, 6);
    await repo.addTransaction(db, expense('cash'));
    assert.equal(
      (await repo.loadFinance(db)).accounts.find((a) => a.id === 'cash')
        .balance,
      1150000,
    );
    assert.equal(db.raw.prepare('PRAGMA foreign_key_check').all().length, 0);
  });

test('demo removal preserves real transactions and their wallet; second cleanup is a no-op', async (t) => {
  const db = createDatabase();
  t.after(() => db.raw.close());
  seedLegacy(db);
  await migrateDbIfNeeded(db);
  await repo.addTransaction(db, expense('cash'));
  await repo.clearDemoData(db);
  let data = await repo.loadFinance(db);
  assert.equal(data.transactions.length, 1);
  assert.equal(data.accounts.length, 1);
  assert.equal(data.accounts[0].balance, -50000);
  assert.equal(data.accounts[0].isDemo, false);
  await repo.clearDemoData(db);
  assert.deepEqual(await repo.loadFinance(db), data);
  assert.equal(
    db.raw
      .prepare(
        'SELECT COUNT(*) AS count FROM transactions WHERE deleted_at IS NOT NULL',
      )
      .get().count,
    6,
  );
});

test('demo cleanup preserves edited balance and new wallets, and does not block real salary', async (t) => {
  const db = createDatabase();
  t.after(() => db.raw.close());
  seedLegacy(db);
  await migrateDbIfNeeded(db);
  await repo.saveAccount(db, {
    id: 'mbbank',
    name: 'My bank',
    type: 'bank',
    balance: 20000000,
  });
  const id = await repo.saveAccount(db, {
    name: 'My cash',
    type: 'cash',
    balance: 500000,
  });
  await repo.recordSalary(
    db,
    salary('mbbank', { month: '2026-10', includedInBalance: true }),
  );
  await repo.clearDemoData(db);
  const data = await repo.loadFinance(db);
  assert.equal(data.accounts.find((a) => a.id === 'mbbank').balance, 20000000);
  assert.equal(data.accounts.find((a) => a.id === id).balance, 500000);
  assert.equal(data.transactions.length, 1);
});

test('invalid money, accounts, dates, transfers and future salary do not mutate balances', async (t) => {
  const db = await fresh(t);
  const id = await repo.saveAccount(db, {
    name: 'Cash',
    type: 'cash',
    balance: 100000,
  });
  for (const amount of [
    0,
    -1,
    0.5,
    NaN,
    Infinity,
    Number.MAX_SAFE_INTEGER + 1,
  ]) {
    await assert.rejects(
      async () => repo.addTransaction(db, expense(id, amount)),
      { code: 'invalidAmount' },
    );
  }
  await assert.rejects(repo.addTransaction(db, expense('missing')), {
    code: 'accountNotFound',
  });
  await assert.rejects(
    async () => repo.addTransaction(db, { ...expense(id), type: 'transfer' }),
    { code: 'unsupportedTransfer' },
  );
  await assert.rejects(
    async () => repo.recordSalary(db, salary(id, { month: '2026-13' })),
    { code: 'invalidMonth' },
  );
  await assert.rejects(
    async () =>
      repo.recordSalary(
        db,
        salary(id, { receivedAt: '2099-01-01T12:00:00.000Z' }),
      ),
    { code: 'futureDate' },
  );
  assert.equal((await repo.loadFinance(db)).accounts[0].balance, 100000);
  assert.equal((await repo.loadFinance(db)).transactions.length, 0);
});

test('overflow after insert rolls back both income and account update', async (t) => {
  const db = await fresh(t);
  const id = await repo.saveAccount(db, {
    name: 'Bank',
    type: 'bank',
    balance: 0,
  });
  db.raw
    .prepare('UPDATE accounts SET opening_balance = ? WHERE id = ?')
    .run(-Number.MAX_SAFE_INTEGER, id);
  await assert.rejects(
    repo.recordSalary(db, salary(id, { includedInBalance: true })),
    { code: 'invalidBalance' },
  );
  assert.equal((await repo.loadFinance(db)).transactions.length, 0);
});

test('money and local calendar parsers reject ambiguous amounts and invalid dates', () => {
  assert.equal(validation.parseMoneyInput('1.200.000'), 1200000);
  assert.equal(validation.parseMoneyInput('-50000'), -50000);
  assert.ok(Number.isNaN(validation.parseMoneyInput('1,5')));
  assert.ok(Number.isNaN(validation.parseMoneyInput('1.5')));
  assert.ok(Number.isNaN(validation.parseMoneyInput('1..200')));
  assert.ok(Number.isNaN(validation.parseMoneyInput('')));
  assert.throws(() => validation.parseInputDate('31/02/2026'), {
    code: 'invalidDate',
  });
  assert.equal(new Date(validation.parseInputDate('29/02/2024')).getDate(), 29);
  assert.equal(validation.shiftMonth('2025-12', 1), '2026-01');
  assert.equal(validation.shiftMonth('2026-01', -1), '2025-12');
});

test('generic income is repeatable and does not consume the salary month', async (t) => {
  const db = await fresh(t);
  const id = await repo.saveAccount(db, {
    name: 'Cash',
    type: 'cash',
    balance: 0,
  });
  const input = { ...expense(id, 100000), type: 'income', category: 'other' };
  await repo.addTransaction(db, input);
  await repo.addTransaction(db, input);
  await repo.recordSalary(db, salary(id));
  assert.equal((await repo.loadFinance(db)).accounts[0].balance, 18200000);
  assert.equal((await repo.loadFinance(db)).transactions.length, 3);
});

test('database unique index independently prevents duplicate active salary months', async (t) => {
  const db = await fresh(t);
  const id = await repo.saveAccount(db, {
    name: 'Cash',
    type: 'cash',
    balance: 0,
  });
  await repo.recordSalary(db, salary(id));
  assert.throws(
    () =>
      db.raw.exec(`INSERT INTO transactions
    (id, profile_id, account_id, title, merchant, amount, type, category, occurred_at, source, created_at, updated_at, salary_month)
    SELECT 'duplicate', profile_id, account_id, title, merchant, amount, type, category, occurred_at, source, created_at, updated_at, salary_month FROM transactions`),
    /UNIQUE constraint/,
  );
});

test('cleanup recognizes seed content, not just a familiar transaction ID', async (t) => {
  const db = createDatabase();
  t.after(() => db.raw.close());
  seedLegacy(db);
  db.raw
    .prepare(
      "UPDATE transactions SET amount = 123000, title = 'My own coffee' WHERE id = 'tx-coffee'",
    )
    .run();
  await migrateDbIfNeeded(db);
  await repo.clearDemoData(db);
  const data = await repo.loadFinance(db);
  assert.equal(data.transactions.length, 1);
  assert.equal(data.transactions[0].title, 'My own coffee');
  assert.equal(data.accounts[0].balance, -123000);
});

test('failed migration rolls back table rebuild and can be retried without losing data', async (t) => {
  const db = createDatabase();
  t.after(() => db.raw.close());
  seedLegacy(db);
  const original = db.execAsync;
  db.execAsync = async (sql) => {
    if (sql.includes('UPDATE accounts SET opening_balance'))
      throw new Error('Injected migration failure');
    return original(sql);
  };
  await assert.rejects(migrateDbIfNeeded(db), /Injected migration failure/);
  assert.equal(db.raw.prepare('PRAGMA user_version').get().user_version, 2);
  assert.equal(
    db.raw.prepare('SELECT COUNT(*) AS count FROM transactions').get().count,
    6,
  );
  assert.equal(
    db.raw
      .prepare('PRAGMA table_info(accounts)')
      .all()
      .some((row) => row.name === 'opening_balance'),
    false,
  );
  db.execAsync = original;
  await migrateDbIfNeeded(db);
  assert.equal((await repo.loadFinance(db)).transactions.length, 6);
});

test('legacy salary deduplication uses local month at the UTC year boundary', async (t) => {
  const previous = process.env.TZ;
  process.env.TZ = 'Asia/Bangkok';
  t.after(() => {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  });
  const db = await fresh(t);
  const id = await repo.saveAccount(db, {
    name: 'Bank',
    type: 'bank',
    balance: 0,
  });
  await repo.addTransaction(db, {
    ...expense(id, 100000),
    type: 'income',
    category: 'salary',
    occurredAt: '2025-12-31T17:30:00.000Z',
  });
  db.raw.prepare('UPDATE transactions SET salary_month = NULL').run();
  await assert.rejects(
    repo.recordSalary(db, salary(id, { month: '2026-01' })),
    { code: 'salaryExists' },
  );
  await repo.recordSalary(db, salary(id, { month: '2025-12' }));
  assert.equal((await repo.loadFinance(db)).transactions.length, 2);
});

test('a removed or another-profile wallet cannot receive money', async (t) => {
  const db = await fresh(t);
  const id = await repo.saveAccount(db, {
    name: 'Cash',
    type: 'cash',
    balance: 100000,
  });
  db.raw
    .prepare("UPDATE accounts SET deleted_at = '2026-01-01' WHERE id = ?")
    .run(id);
  await assert.rejects(repo.addTransaction(db, expense(id)), {
    code: 'accountNotFound',
  });
  db.raw.exec(
    "INSERT INTO profiles (id,device_id,created_at,updated_at) VALUES ('another','device','','')",
  );
  db.raw
    .prepare(
      "UPDATE accounts SET deleted_at = NULL, profile_id = 'another' WHERE id = ?",
    )
    .run(id);
  await assert.rejects(repo.addTransaction(db, expense(id)), {
    code: 'accountNotFound',
  });
  assert.equal((await repo.loadFinance(db)).transactions.length, 0);
});

test('full reset removes real/demo/tombstone data and remains empty after reload', async (t) => {
  const db = createDatabase();
  t.after(() => db.raw.close());
  seedLegacy(db);
  await migrateDbIfNeeded(db);
  const id = await repo.saveAccount(db, {
    name: 'Real bank',
    type: 'bank',
    balance: 100000,
  });
  await repo.recordSalary(db, salary(id));
  await repo.addTransaction(db, expense('cash'));
  await repo.clearDemoData(db);
  await repo.resetFinancialData(db);
  const data = await repo.loadFinance(db);
  assert.equal(data.accounts.length, 0);
  assert.equal(data.transactions.length, 0);
  assert.equal(
    db.raw.prepare('SELECT COUNT(*) AS count FROM transactions').get().count,
    0,
  );
  assert.deepEqual(data.settings, {
    initialBalance: 0,
    monthlyIncome: 0,
    salaryDay: 1,
  });
  await migrateDbIfNeeded(db);
  assert.deepEqual(await repo.loadFinance(db), data);
  const nextId = await repo.saveAccount(db, {
    name: 'New wallet',
    type: 'cash',
    balance: 0,
  });
  await repo.recordSalary(db, salary(nextId));
  assert.equal((await repo.loadFinance(db)).transactions.length, 1);
});

test('failed full reset rolls back all destructive writes', async (t) => {
  const db = await fresh(t);
  const id = await repo.saveAccount(db, {
    name: 'Cash',
    type: 'cash',
    balance: 100000,
  });
  await repo.addTransaction(db, expense(id));
  const before = await repo.loadFinance(db);
  const original = db.runAsync;
  db.runAsync = async (sql, ...args) => {
    if (sql.startsWith('UPDATE settings'))
      throw new Error('Injected reset failure');
    return original(sql, ...args);
  };
  await assert.rejects(repo.resetFinancialData(db), /Injected reset failure/);
  db.runAsync = original;
  assert.deepEqual(await repo.loadFinance(db), before);
});

test('full reset is scoped to the local profile and preserves identity and other profiles', async (t) => {
  const db = await fresh(t);
  const foreignId = await repo.saveAccount(db, {
    name: 'Other wallet',
    type: 'cash',
    balance: 100000,
  });
  await repo.addTransaction(db, expense(foreignId));
  db.raw.exec(
    "INSERT INTO profiles (id,device_id,created_at,updated_at) VALUES ('another','device','','')",
  );
  db.raw
    .prepare("UPDATE accounts SET profile_id = 'another' WHERE id = ?")
    .run(foreignId);
  db.raw
    .prepare(
      "UPDATE transactions SET profile_id = 'another' WHERE account_id = ?",
    )
    .run(foreignId);
  await repo.saveAccount(db, {
    name: 'My wallet',
    type: 'cash',
    balance: 500000,
  });
  await repo.resetFinancialData(db);
  assert.equal((await repo.loadFinance(db)).accounts.length, 0);
  assert.equal(
    db.raw.prepare('SELECT balance FROM accounts WHERE id = ?').get(foreignId)
      .balance,
    50000,
  );
  assert.equal(
    db.raw
      .prepare(
        "SELECT COUNT(*) AS count FROM transactions WHERE profile_id = 'another'",
      )
      .get().count,
    1,
  );
  assert.equal(
    db.raw.prepare('SELECT COUNT(*) AS count FROM profiles').get().count,
    2,
  );
  assert.equal(db.raw.prepare('PRAGMA foreign_key_check').all().length, 0);
});
