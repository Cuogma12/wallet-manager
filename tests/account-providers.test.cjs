const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { loadTypescript } = require('./helpers/loadTypescript.cjs');
const { createDatabase } = require('./helpers/sqlite.cjs');
const { migrateDbIfNeeded } = loadTypescript('src/db/database.ts');
const repo = loadTypescript('src/db/repositories/financeRepository.ts');
const backup = loadTypescript('src/db/repositories/backupRepository.ts');
const { accountProviders, getAccountProvider } = loadTypescript(
  'src/shared/constants/accountProviders.ts',
);
const { searchAccountProviders, suggestAccountName } = loadTypescript(
  'src/shared/utils/accountProviders.ts',
);

async function fresh(t) {
  const db = createDatabase();
  t.after(() => db.raw.close());
  await migrateDbIfNeeded(db);
  return db;
}

test('offline catalog has unique stable IDs and a bundled image for every provider', () => {
  assert.equal(
    new Set(accountProviders.map((p) => p.id)).size,
    accountProviders.length,
  );
  assert.equal(accountProviders.filter((p) => p.type === 'bank').length, 20);
  assert.equal(accountProviders.filter((p) => p.type === 'wallet').length, 5);
  const iconDir = path.resolve(
    __dirname,
    '../src/shared/components/atoms/icons',
  );
  const mapping = fs.readFileSync(
    path.join(iconDir, 'institutionLogos.ts'),
    'utf8',
  );
  for (const provider of accountProviders) {
    assert.match(provider.id, /^[a-z0-9_-]+$/);
    const match = mapping.match(
      new RegExp(`${provider.id}: require\\('([^']+)'\\)`),
    );
    assert.ok(match, `Missing image mapping: ${provider.id}`);
    const image = fs.readFileSync(path.resolve(iconDir, match[1]));
    assert.ok(image.length > 100, `Empty image: ${provider.id}`);
    assert.ok(
      image
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
        image.readUInt16BE(0) === 0xffd8,
      `Invalid raster image: ${provider.id}`,
    );
  }
  assert.equal(getAccountProvider('__proto__'), undefined);
});

test('search is type-scoped, accent/case insensitive and supports bank aliases', () => {
  assert.equal(searchAccountProviders('bank', '  QUAN DOI  ')[0].id, 'mbbank');
  assert.equal(
    searchAccountProviders('bank', 'ngoại thương')[0].id,
    'vietcombank',
  );
  assert.equal(searchAccountProviders('bank', 'tCb')[0].id, 'techcombank');
  assert.equal(searchAccountProviders('wallet', 'airpay')[0].id, 'shopeepay');
  assert.equal(searchAccountProviders('bank', 'momo').length, 0);
  assert.equal(searchAccountProviders('cash', '').length, 0);
  assert.equal(searchAccountProviders('wallet', 'not-a-provider').length, 0);
});

test('provider suggestions fill defaults without overwriting personal names', () => {
  assert.equal(suggestAccountName('', null, 'momo'), 'MoMo');
  assert.equal(suggestAccountName('MoMo', 'momo', 'zalopay'), 'ZaloPay');
  assert.equal(
    suggestAccountName('Ví ăn uống', 'momo', 'zalopay'),
    'Ví ăn uống',
  );
  assert.equal(suggestAccountName('MoMo', 'momo', null), '');
  assert.equal(suggestAccountName('Ví ăn uống', 'momo', null), 'Ví ăn uống');
});

test('provider is independent of nickname, persists and does not imply a connection or create income', async (t) => {
  const db = await fresh(t);
  const input = {
    name: 'Lương chính',
    type: 'bank',
    providerId: 'mbbank',
    balance: 100000,
  };
  const id = await repo.saveAccount(db, input);
  await repo.saveAccount(db, input); // Two accounts at the same bank are allowed.
  await repo.saveAccount(db, {
    id,
    name: 'Tiết kiệm',
    type: 'bank',
    balance: 100000,
  });
  await migrateDbIfNeeded(db);
  const data = await repo.loadFinance(db);
  const account = data.accounts.find((a) => a.id === id);
  assert.equal(account.providerId, 'mbbank');
  assert.equal(account.name, 'Tiết kiệm');
  assert.equal(account.syncStatus, 'local');
  assert.equal(data.accounts.length, 2);
  assert.equal(data.transactions.length, 0);
  const row = db.raw
    .prepare(
      'SELECT external_id, balance, opening_balance FROM accounts WHERE id = ?',
    )
    .get(id);
  assert.equal(row.external_id, null);
  assert.equal(row.balance, 100000);
  assert.equal(row.opening_balance, 100000);
});

test('invalid/mismatched providers cannot mutate money; Other and type changes clear identity', async (t) => {
  const db = await fresh(t);
  const id = await repo.saveAccount(db, {
    name: 'MB',
    type: 'bank',
    providerId: 'mbbank',
    balance: 100000,
  });
  const before = await repo.loadFinance(db);
  for (const providerId of ['missing', 'momo', '', '__proto__']) {
    await assert.rejects(
      repo.saveAccount(db, {
        id,
        name: 'Bad',
        type: 'bank',
        providerId,
        balance: 1,
      }),
      { code: 'invalidAccountProvider' },
    );
  }
  await assert.rejects(
    repo.saveAccount(db, {
      name: 'Bad cash',
      type: 'cash',
      providerId: 'mbbank',
      balance: 1,
    }),
    { code: 'invalidAccountProvider' },
  );
  assert.deepEqual(await repo.loadFinance(db), before);
  await repo.saveAccount(db, {
    id,
    name: 'Other bank',
    type: 'bank',
    providerId: null,
    balance: 100000,
  });
  assert.equal((await repo.loadFinance(db)).accounts[0].providerId, undefined);
  await repo.saveAccount(db, {
    id,
    name: 'MoMo',
    type: 'wallet',
    providerId: 'momo',
    balance: 100000,
  });
  await repo.saveAccount(db, {
    id,
    name: 'Cash',
    type: 'cash',
    balance: 100000,
  });
  assert.equal((await repo.loadFinance(db)).accounts[0].providerId, undefined);
  assert.equal((await repo.loadFinance(db)).accounts[0].balance, 100000);
});

test('v3 migration preserves all money and names, never guesses a provider, and retries safely', async (t) => {
  const db = await fresh(t);
  const id = await repo.saveAccount(db, {
    name: 'MoMo',
    type: 'bank',
    balance: 100000,
  });
  await repo.addTransaction(db, {
    accountId: id,
    title: 'Lunch',
    amount: 20000,
    type: 'expense',
    category: 'food',
    categoryIcon: '',
    occurredAt: '2026-01-01T00:00:00.000Z',
  });
  const before = await repo.loadFinance(db);
  db.raw.exec(
    'ALTER TABLE accounts DROP COLUMN provider_id; PRAGMA user_version = 3;',
  );
  const original = db.execAsync;
  db.execAsync = async (sql) => {
    await original(sql);
    if (sql.includes('ADD COLUMN provider_id'))
      throw new Error('Injected v4 failure');
  };
  await assert.rejects(migrateDbIfNeeded(db), /Injected v4 failure/);
  assert.equal(db.raw.prepare('PRAGMA user_version').get().user_version, 3);
  assert.equal(
    db.raw
      .prepare('PRAGMA table_info(accounts)')
      .all()
      .some((c) => c.name === 'provider_id'),
    false,
  );
  db.execAsync = original;
  await migrateDbIfNeeded(db);
  await migrateDbIfNeeded(db);
  assert.deepEqual(await repo.loadFinance(db), before);
  assert.equal(db.raw.prepare('PRAGMA user_version').get().user_version, 4);
  assert.equal(db.raw.prepare('PRAGMA foreign_key_check').all().length, 0);
});

test('backup preserves provider identity, accepts old backups and safely retains unknown future IDs', async (t) => {
  const db = await fresh(t);
  await repo.saveAccount(db, {
    name: 'My wallet',
    type: 'wallet',
    providerId: 'momo',
    balance: 12345,
  });
  const snapshot = await backup.exportBackup(db);
  assert.equal(snapshot.accounts[0].providerId, 'momo');
  const target = await fresh(t);
  await backup.restoreBackup(target, snapshot);
  assert.equal((await repo.loadFinance(target)).accounts[0].providerId, 'momo');
  const before = await repo.loadFinance(target);
  for (const providerId of ['mbbank', 'https://untrusted.example/logo.png']) {
    await assert.rejects(
      backup.restoreBackup(target, {
        ...snapshot,
        accounts: [{ ...snapshot.accounts[0], providerId }],
      }),
      { code: 'invalidBackup' },
    );
  }
  assert.deepEqual(await repo.loadFinance(target), before);
  snapshot.accounts[0].providerId = 'future-wallet';
  await backup.restoreBackup(target, snapshot);
  assert.equal(
    (await repo.loadFinance(target)).accounts[0].providerId,
    'future-wallet',
  );
  assert.equal(getAccountProvider('future-wallet'), undefined);
  await repo.saveAccount(target, {
    id: snapshot.accounts[0].id,
    name: 'Renamed',
    type: 'wallet',
    providerId: 'future-wallet',
    balance: 12345,
  });
  assert.equal(
    (await backup.exportBackup(target)).accounts[0].providerId,
    'future-wallet',
  );
  delete snapshot.accounts[0].providerId;
  await backup.restoreBackup(target, snapshot);
  assert.equal(
    (await repo.loadFinance(target)).accounts[0].providerId,
    undefined,
  );
});
