const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTypescript } = require('./helpers/loadTypescript.cjs');
const { createDatabase } = require('./helpers/sqlite.cjs');

const { migrateDbIfNeeded } = loadTypescript('src/db/database.ts');
const finance = loadTypescript('src/db/repositories/financeRepository.ts');
const categories = loadTypescript('src/db/repositories/categoryRepository.ts');
const budgets = loadTypescript('src/db/repositories/budgetRepository.ts');
const backup = loadTypescript('src/db/repositories/backupRepository.ts');
const { summarizeBudgets } = loadTypescript(
  'src/shared/utils/budgetSummary.ts',
);

async function fresh(t) {
  const db = createDatabase();
  t.after(() => db.raw.close());
  await migrateDbIfNeeded(db);
  return db;
}

test('v5 migration adds custom categories atomically without changing the ledger', async (t) => {
  const db = await fresh(t);
  const accountId = await finance.saveAccount(db, {
    name: 'Cash',
    type: 'cash',
    balance: 500000,
  });
  await finance.addTransaction(db, {
    accountId,
    title: 'Lunch',
    amount: 50000,
    type: 'expense',
    category: 'food',
    categoryIcon: '',
    occurredAt: '2026-11-01T12:00:00.000Z',
  });
  const before = await finance.loadFinance(db);
  db.raw.exec('DROP TABLE custom_categories; PRAGMA user_version = 5');
  const original = db.execAsync;
  db.execAsync = async (sql) => {
    await original(sql);
    if (sql.includes('CREATE TABLE custom_categories'))
      throw new Error('injected category migration failure');
  };
  await assert.rejects(
    migrateDbIfNeeded(db),
    /injected category migration failure/,
  );
  assert.equal(db.raw.prepare('PRAGMA user_version').get().user_version, 5);
  assert.equal(
    db.raw
      .prepare(
        "SELECT COUNT(*) AS count FROM sqlite_master WHERE name = 'custom_categories'",
      )
      .get().count,
    0,
  );
  db.execAsync = original;
  await migrateDbIfNeeded(db);
  assert.equal(db.raw.prepare('PRAGMA user_version').get().user_version, 6);
  assert.deepEqual(await finance.loadFinance(db), before);
});

test('custom category is reusable by transactions and budgets with normalized duplicate protection', async (t) => {
  const db = await fresh(t);
  const categoryId = await categories.saveCustomCategory(db, {
    name: '  Thú   cưng  ',
  });
  await assert.rejects(
    categories.saveCustomCategory(db, { name: 'thu CƯNG' }),
    { code: 'categoryExists' },
  );
  assert.throws(
    () => categories.saveCustomCategory(db, { name: ' '.repeat(5) }),
    { code: 'invalidCategoryName' },
  );
  const accountId = await finance.saveAccount(db, {
    name: 'Ví',
    type: 'cash',
    balance: 1000000,
  });
  await budgets.saveBudget(db, {
    month: '2026-11',
    category: categoryId,
    limit: 300000,
  });
  await finance.addTransaction(db, {
    accountId,
    title: 'Hạt cho mèo',
    amount: 120000,
    type: 'expense',
    category: categoryId,
    categoryIcon: 'tag-outline',
    occurredAt: '2026-11-03T12:00:00.000Z',
  });
  const data = await finance.loadFinance(db);
  assert.deepEqual(
    data.customCategories.map((row) => ({ ...row })),
    [{ id: categoryId, name: 'Thú cưng', icon: 'tag-outline' }],
  );
  assert.equal(data.transactions[0].categoryIcon, 'tag-outline');
  const summary = summarizeBudgets(data.budgets, data.transactions, '2026-11');
  assert.equal(summary.spent, 120000n);
  assert.equal(summary.items[0].remaining, 180000n);
  await assert.rejects(
    finance.addTransaction(db, {
      accountId,
      title: 'Unknown',
      amount: 1,
      type: 'expense',
      category: 'category-missing',
      categoryIcon: '',
      occurredAt: '2026-11-04T12:00:00.000Z',
    }),
    { code: 'invalidCategory' },
  );
});

test('custom categories are profile-scoped, reset locally, and roundtrip in v3 backup', async (t) => {
  const source = await fresh(t);
  const categoryId = await categories.saveCustomCategory(source, {
    name: 'Học tập',
  });
  const accountId = await finance.saveAccount(source, {
    name: 'Bank',
    type: 'bank',
    balance: 500000,
  });
  await budgets.saveBudget(source, {
    month: '2026-11',
    category: categoryId,
    limit: 200000,
  });
  await finance.addTransaction(source, {
    accountId,
    title: 'Sách',
    amount: 50000,
    type: 'expense',
    category: categoryId,
    categoryIcon: 'tag-outline',
    occurredAt: '2026-11-05T12:00:00.000Z',
  });
  const snapshot = await backup.exportBackup(source);
  assert.equal(snapshot.version, 3);
  assert.deepEqual(snapshot.customCategories, [
    { id: categoryId, name: 'Học tập', icon: 'tag-outline' },
  ]);

  const target = await fresh(t);
  await backup.restoreBackup(target, snapshot);
  const restored = await finance.loadFinance(target);
  assert.deepEqual(
    restored.customCategories.map((row) => ({ ...row })),
    snapshot.customCategories,
  );
  assert.deepEqual(
    restored.budgets.map((row) => ({ ...row })),
    snapshot.budgets,
  );
  assert.equal(restored.transactions[0].category, categoryId);

  const before = await finance.loadFinance(target);
  for (const malformed of [
    { ...snapshot, customCategories: undefined },
    {
      ...snapshot,
      customCategories: [
        ...snapshot.customCategories,
        { ...snapshot.customCategories[0], id: 'category-duplicate' },
      ],
    },
    {
      ...snapshot,
      customCategories: [],
    },
  ]) {
    await assert.rejects(backup.restoreBackup(target, malformed), {
      code: 'invalidBackup',
    });
    assert.deepEqual(await finance.loadFinance(target), before);
  }

  const timestamp = new Date().toISOString();
  target.raw.exec(
    `INSERT INTO profiles VALUES ('foreign', NULL, 'device', 0, '${timestamp}', '${timestamp}');
     INSERT INTO custom_categories
       (id, profile_id, name, normalized_name, icon, created_at, updated_at)
     VALUES ('foreign-category', 'foreign', 'Foreign', 'foreign', 'tag-outline', '${timestamp}', '${timestamp}')`,
  );
  await assert.rejects(
    budgets.saveBudget(target, {
      month: '2026-11',
      category: 'foreign-category',
      limit: 1,
    }),
    { code: 'invalidCategory' },
  );
  await finance.resetFinancialData(target);
  assert.equal(
    target.raw
      .prepare(
        "SELECT COUNT(*) AS count FROM custom_categories WHERE profile_id = 'foreign'",
      )
      .get().count,
    1,
  );
});
