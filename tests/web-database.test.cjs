const assert = require('node:assert/strict');
const { test } = require('node:test');
const initSqlJs = require('sql.js');
const { loadTypescript } = require('./helpers/loadTypescript.cjs');
const { createWebDatabase } = loadTypescript('src/db/web/sqliteAdapter.ts');
const { migrateDbIfNeeded } = loadTypescript('src/db/database.ts');
const repo = loadTypescript('src/db/repositories/financeRepository.ts');
const { FinanceError } = loadTypescript(
  'src/shared/utils/financeValidation.ts',
);
const engine = initSqlJs();

function storage() {
  return {
    revision: 0,
    bytes: null,
    fail: false,
    async load() {
      return this.bytes
        ? { revision: this.revision, bytes: this.bytes.slice() }
        : null;
    },
    async save(bytes, revision) {
      if (this.fail) throw new Error('Quota exceeded');
      if (revision !== this.revision)
        throw new FinanceError('webStorageConflict');
      this.bytes = bytes.slice();
      return ++this.revision;
    },
    close() {},
  };
}

async function fresh(t, store = storage()) {
  const db = await createWebDatabase(await engine, store);
  t.after(() => db.close());
  await migrateDbIfNeeded(db);
  return { db, store };
}

test('browser SQLite persists schema, ledger and balances and reopens with foreign keys enabled', async (t) => {
  const { db, store } = await fresh(t);
  const accountId = await repo.saveAccount(db, {
    name: 'Web cash',
    type: 'cash',
    balance: 100000,
  });
  await repo.addTransaction(db, {
    accountId,
    title: 'Lunch',
    amount: 50000,
    type: 'expense',
    category: 'food',
    categoryIcon: '',
    occurredAt: '2026-01-01T00:00:00.000Z',
  });
  const reopened = await createWebDatabase(await engine, store);
  t.after(() => reopened.close());
  assert.equal((await repo.loadFinance(reopened)).accounts[0].balance, 50000);
  assert.equal((await repo.loadFinance(reopened)).transactions.length, 1);
  assert.equal(
    (await reopened.getFirstAsync('PRAGMA foreign_keys')).foreign_keys,
    1,
  );
  assert.equal(
    (await reopened.getFirstAsync('PRAGMA user_version')).user_version,
    3,
  );
  const revision = store.revision;
  await migrateDbIfNeeded(reopened);
  assert.equal(
    store.revision,
    revision,
    'opening an up-to-date DB must not invalidate another tab',
  );
});

test('failed browser persistence restores both the in-memory ledger and stored image', async (t) => {
  const { db, store } = await fresh(t);
  await repo.saveAccount(db, {
    name: 'Existing',
    type: 'cash',
    balance: 100000,
  });
  const before = await repo.loadFinance(db);
  const revision = store.revision;
  store.fail = true;
  await assert.rejects(
    repo.saveAccount(db, {
      name: 'Must not appear',
      type: 'cash',
      balance: 123,
    }),
    /Quota exceeded/,
  );
  assert.deepEqual(await repo.loadFinance(db), before);
  assert.equal(store.revision, revision);
  store.fail = false;
  const reopened = await createWebDatabase(await engine, store);
  t.after(() => reopened.close());
  assert.deepEqual(await repo.loadFinance(reopened), before);
});

test('a stale browser tab cannot overwrite another tab and becomes read-only until reload', async (t) => {
  const { db, store } = await fresh(t);
  const stale = await createWebDatabase(await engine, store);
  t.after(() => stale.close());
  await repo.saveAccount(db, { name: 'Newer tab', type: 'bank', balance: 500 });
  await assert.rejects(
    repo.saveAccount(stale, {
      name: 'Stale overwrite',
      type: 'cash',
      balance: 1,
    }),
    { code: 'webStorageConflict' },
  );
  await assert.rejects(repo.loadFinance(stale), { code: 'webStorageConflict' });
  const reopened = await createWebDatabase(await engine, store);
  t.after(() => reopened.close());
  assert.equal(
    (await repo.loadFinance(reopened)).accounts[0].name,
    'Newer tab',
  );
});

test('browser SQL transaction failure does not commit partial changes', async (t) => {
  const { db, store } = await fresh(t);
  const revision = store.revision;
  await assert.rejects(
    db.withTransactionAsync(async () => {
      await db.runAsync('UPDATE settings SET monthly_income = 999');
      await db.runAsync('INSERT INTO table_that_does_not_exist VALUES (1)');
    }),
    /no such table/,
  );
  assert.equal(
    (await db.getFirstAsync('SELECT monthly_income FROM settings'))
      .monthly_income,
    0,
  );
  assert.equal(store.revision, revision);
  assert.equal((await db.getFirstAsync('PRAGMA foreign_keys')).foreign_keys, 1);
});
