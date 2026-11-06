const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTypescript } = require('./helpers/loadTypescript.cjs');
const { createDatabase } = require('./helpers/sqlite.cjs');
const { migrateDbIfNeeded } = loadTypescript('src/db/database.ts');
const finance = loadTypescript('src/db/repositories/financeRepository.ts');
const repo = loadTypescript('src/db/repositories/budgetRepository.ts');
const backup = loadTypescript('src/db/repositories/backupRepository.ts');
const { summarizeBudgets } = loadTypescript(
  'src/shared/utils/budgetSummary.ts',
);
const { formatCurrency } = loadTypescript('src/shared/utils/format.ts');
const { parseBackup } = loadTypescript('src/shared/utils/backupValidation.ts');

async function fresh(t) {
  const db = createDatabase();
  t.after(() => db.raw.close());
  await migrateDbIfNeeded(db);
  return db;
}
const input = (extra = {}) => ({
  month: '2026-01',
  category: 'food',
  limit: 100000,
  ...extra,
});
const tx = (amount, extra = {}) => ({
  amount,
  type: 'expense',
  category: 'food',
  occurredAt: new Date(2026, 0, 15, 12).toISOString(),
  ...extra,
});

test('v4 migration preserves ledger and rolls back/retries atomically', async (t) => {
  const db = await fresh(t);
  const accountId = await finance.saveAccount(db, {
    name: 'Keep',
    type: 'cash',
    balance: 200000,
  });
  await finance.addTransaction(db, {
    ...tx(10000),
    accountId,
    title: 'Lunch',
    categoryIcon: '',
  });
  const before = await finance.loadFinance(db);
  db.raw.exec(
    'DROP TABLE custom_categories; DROP TABLE budgets; PRAGMA user_version = 4',
  );
  const original = db.execAsync;
  db.execAsync = async (sql) => {
    await original(sql);
    if (sql.includes('CREATE TABLE budgets'))
      throw new Error('migration failure');
  };
  await assert.rejects(migrateDbIfNeeded(db), /migration failure/);
  assert.equal(db.raw.prepare('PRAGMA user_version').get().user_version, 4);
  assert.equal(
    db.raw
      .prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name='budgets'")
      .get().n,
    0,
  );
  db.execAsync = original;
  await migrateDbIfNeeded(db);
  await migrateDbIfNeeded(db);
  assert.equal(db.raw.prepare('PRAGMA user_version').get().user_version, 6);
  assert.deepEqual(await finance.loadFinance(db), before);
  assert.equal(db.raw.prepare('PRAGMA foreign_key_check').all().length, 0);
});

test('budget CRUD is month-specific, tombstoned and never changes money', async (t) => {
  const db = await fresh(t);
  await finance.saveAccount(db, {
    name: 'Cash',
    type: 'cash',
    balance: 300000,
  });
  const before = await finance.loadFinance(db);
  const id = await repo.saveBudget(db, input());
  const created = db.raw
    .prepare('SELECT created_at FROM budgets WHERE id=?')
    .get(id).created_at;
  await assert.rejects(repo.saveBudget(db, input()), { code: 'budgetExists' });
  await repo.saveBudget(db, input({ month: '2026-02' }));
  await repo.saveBudget(db, input({ id, limit: 200000, category: 'shopping' }));
  assert.equal(
    db.raw.prepare('SELECT created_at FROM budgets WHERE id=?').get(id)
      .created_at,
    created,
  );
  let snapshot = await finance.loadFinance(db);
  assert.equal(snapshot.budgets.length, 2);
  assert.equal(snapshot.budgets.find((b) => b.id === id).limit, 200000);
  await repo.deleteBudget(db, id);
  await assert.rejects(repo.deleteBudget(db, id), { code: 'budgetNotFound' });
  await assert.rejects(repo.saveBudget(db, input({ id })), {
    code: 'budgetNotFound',
  });
  const replacement = await repo.saveBudget(
    db,
    input({ category: 'shopping' }),
  );
  assert.notEqual(replacement, id);
  assert.ok(
    db.raw.prepare('SELECT deleted_at FROM budgets WHERE id=?').get(id)
      .deleted_at,
  );
  snapshot = await finance.loadFinance(db);
  assert.deepEqual(snapshot.accounts, before.accounts);
  assert.deepEqual(snapshot.transactions, before.transactions);
});

test('invalid inputs, duplicate edits and racing creates cannot corrupt budgets', async (t) => {
  const db = await fresh(t);
  for (const extra of [
    { limit: 0 },
    { limit: -1 },
    { limit: 0.5 },
    { limit: NaN },
    { limit: Infinity },
    { limit: Number.MAX_SAFE_INTEGER + 1 },
    { category: 'salary' },
    { month: '2026-13' },
  ]) {
    await assert.rejects(async () => repo.saveBudget(db, input(extra)));
  }
  const results = await Promise.allSettled([
    repo.saveBudget(db, input()),
    repo.saveBudget(db, input()),
  ]);
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(
    results.find((r) => r.status === 'rejected').reason.code,
    'budgetExists',
  );
  const other = await repo.saveBudget(db, input({ category: 'shopping' }));
  const before = await finance.loadFinance(db);
  await assert.rejects(repo.saveBudget(db, input({ id: other })), {
    code: 'budgetExists',
  });
  assert.deepEqual(await finance.loadFinance(db), before);
  assert.throws(
    () =>
      db.raw.exec(
        "INSERT INTO budgets SELECT 'duplicate',profile_id,month,category,limit_amount,sync_state,created_at,updated_at,deleted_at FROM budgets WHERE category='food'",
      ),
    /UNIQUE constraint/,
  );
});

test('foreign budgets are isolated from reads, edits, deletes, reset and backup restore', async (t) => {
  const db = await fresh(t);
  const id = await repo.saveBudget(db, input());
  const snapshot = await backup.exportBackup(db);
  db.raw.exec(
    "INSERT INTO profiles (id,device_id,created_at,updated_at) VALUES ('other','device','','')",
  );
  db.raw.prepare("UPDATE budgets SET profile_id='other' WHERE id=?").run(id);
  assert.equal((await finance.loadFinance(db)).budgets.length, 0);
  await assert.rejects(repo.saveBudget(db, input({ id })), {
    code: 'budgetNotFound',
  });
  await assert.rejects(repo.deleteBudget(db, id), { code: 'budgetNotFound' });
  await assert.rejects(backup.restoreBackup(db, snapshot), {
    code: 'restoreUnavailable',
  });
  await repo.saveBudget(db, input());
  await finance.resetFinancialData(db);
  assert.equal((await finance.loadFinance(db)).budgets.length, 0);
  assert.equal(db.raw.prepare('SELECT id FROM budgets').get().id, id);
  await backup.restoreBackup(db, { ...snapshot, budgets: [] });
  assert.equal(db.raw.prepare('SELECT id FROM budgets').get().id, id);
});

test('budget percentages warn at 80%, separate unbudgeted spending, and ignore income/transfer/demo/other months', () => {
  const budgets = [
    { ...input(), id: 'b' },
    { ...input({ month: '2026-02' }), id: 'next' },
  ];
  for (const [amount, status] of [
    [79000, 'normal'],
    [80000, 'near'],
    [100000, 'exhausted'],
    [150000, 'over'],
  ]) {
    const summary = summarizeBudgets(
      budgets,
      [
        tx(amount),
        tx(999999, { type: 'income' }),
        tx(999999, { type: 'transfer' }),
        tx(999999, { isDemo: true }),
        tx(999999, { occurredAt: new Date(2026, 1, 1, 12).toISOString() }),
        tx(12000, { category: 'other' }),
      ],
      '2026-01',
    );
    assert.equal(summary.spent, BigInt(amount));
    assert.equal(summary.remaining, 100000n - BigInt(amount));
    assert.equal(summary.items.length, 1);
    assert.equal(summary.items[0].status, status);
    assert.equal(summary.alerts, status === 'normal' ? 0 : 1);
    assert.equal(summary.unbudgeted, 12000n);
    assert.equal(summary.progress, Math.min(amount / 100000, 1));
  }
  const empty = summarizeBudgets([], [tx(50000)], '2026-01');
  assert.equal(empty.status, 'normal');
  assert.equal(empty.percent, '0');
  assert.equal(empty.unbudgeted, 50000n);
});

test('budget totals retain exact integers above Number.MAX_SAFE_INTEGER and use local month boundaries', () => {
  const before = process.env.TZ;
  process.env.TZ = 'Asia/Bangkok';
  try {
    const max = Number.MAX_SAFE_INTEGER;
    const summary = summarizeBudgets(
      [{ ...input({ limit: max }), id: 'b' }],
      [
        tx(max, { occurredAt: '2025-12-31T17:00:00.000Z' }),
        tx(max),
        tx(1000, { occurredAt: '2026-01-31T17:00:00.000Z' }),
      ],
      '2026-01',
    );
    assert.equal(summary.spent, BigInt(max) * 2n);
    assert.equal(summary.percent, '200');
    assert.equal(summary.remaining, -BigInt(max));
    assert.equal(formatCurrency(summary.spent), '18.014.398.509.481.982 ₫');
  } finally {
    if (before === undefined) delete process.env.TZ;
    else process.env.TZ = before;
  }
});

test('editing or deleting a real expense recalculates budget use without cached totals', async (t) => {
  const db = await fresh(t);
  const accountId = await finance.saveAccount(db, {
    name: 'Cash',
    type: 'cash',
    balance: 300000,
  });
  await repo.saveBudget(db, input());
  await finance.addTransaction(db, {
    ...tx(80000),
    accountId,
    title: 'Lunch',
    categoryIcon: '',
  });
  let data = await finance.loadFinance(db);
  assert.equal(
    summarizeBudgets(data.budgets, data.transactions, '2026-01').status,
    'near',
  );
  await finance.updateTransaction(db, {
    ...data.transactions[0],
    amount: 120000,
  });
  data = await finance.loadFinance(db);
  assert.equal(
    summarizeBudgets(data.budgets, data.transactions, '2026-01').status,
    'over',
  );
  await finance.deleteTransaction(db, data.transactions[0].id);
  data = await finance.loadFinance(db);
  assert.equal(
    summarizeBudgets(data.budgets, data.transactions, '2026-01').spent,
    0n,
  );
});

test('v3 backup roundtrips budgets; legacy v1 restore explicitly replaces limits with empty data', async (t) => {
  const source = await fresh(t);
  await repo.saveBudget(source, input());
  const snapshot = await backup.exportBackup(source);
  assert.equal(snapshot.version, 3);
  assert.equal(snapshot.budgets.length, 1);
  const target = await fresh(t);
  await backup.restoreBackup(target, JSON.parse(JSON.stringify(snapshot)));
  await backup.restoreBackup(target, snapshot);
  assert.deepEqual(
    (await finance.loadFinance(target)).budgets.map((row) => ({ ...row })),
    snapshot.budgets,
  );
  const { budgets, customCategories, ...legacy } = snapshot;
  await backup.restoreBackup(target, { ...legacy, version: 1 });
  assert.deepEqual((await finance.loadFinance(target)).budgets, []);
});

test('malformed v3 backup budgets fail validation before any data is changed', async (t) => {
  const db = await fresh(t);
  await repo.saveBudget(db, input());
  const snapshot = await backup.exportBackup(db);
  const before = await finance.loadFinance(db);
  const budget = snapshot.budgets[0];
  for (const budgets of [
    undefined,
    {},
    [{ ...budget, limit: 0 }],
    [{ ...budget, limit: 0.1 }],
    [{ ...budget, limit: Number.MAX_SAFE_INTEGER + 1 }],
    [{ ...budget, category: 'salary' }],
    [{ ...budget, month: '2026-13' }],
    [budget, budget],
    [budget, { ...budget, id: 'different' }],
  ]) {
    await assert.rejects(backup.restoreBackup(db, { ...snapshot, budgets }), {
      code: 'invalidBackup',
    });
    assert.deepEqual(await finance.loadFinance(db), before);
  }
  const parsed = parseBackup({
    ...snapshot,
    budgets: [{ ...budget, profile_id: 'foreign', sync_state: 'synced' }],
  });
  assert.deepEqual(parsed.budgets, snapshot.budgets);
});

test('failed reset and restore roll back budget deletion alongside all financial data', async (t) => {
  const db = await fresh(t);
  await repo.saveBudget(db, input());
  const before = await finance.loadFinance(db);
  const snapshot = await backup.exportBackup(db);
  const original = db.runAsync;
  db.runAsync = async (sql, ...args) => {
    if (sql.startsWith('UPDATE settings')) throw new Error('injected failure');
    return original(sql, ...args);
  };
  await assert.rejects(finance.resetFinancialData(db), /injected failure/);
  await assert.rejects(
    backup.restoreBackup(db, { ...snapshot, budgets: [] }),
    /injected failure/,
  );
  db.runAsync = original;
  assert.deepEqual(await finance.loadFinance(db), before);
  await finance.resetFinancialData(db);
  await migrateDbIfNeeded(db);
  assert.deepEqual((await finance.loadFinance(db)).budgets, []);
});
