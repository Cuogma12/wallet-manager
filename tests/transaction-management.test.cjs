const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTypescript } = require('./helpers/loadTypescript.cjs');
const { createDatabase } = require('./helpers/sqlite.cjs');
const { migrateDbIfNeeded } = loadTypescript('src/db/database.ts');
const repo = loadTypescript('src/db/repositories/financeRepository.ts');

test('unchanged expenses near the safe integer boundary never lose a dong', async (t) => {
  const { db, a, input, id } = await setup(t);
  await repo.updateTransaction(db, { ...input, id, amount: 2 });
  await repo.saveAccount(db, {
    id: a,
    name: 'Cash',
    type: 'cash',
    balance: Number.MAX_SAFE_INTEGER - 2,
  });
  // Rebase is safe; then another income brings the current balance to the boundary.
  await repo.addTransaction(db, {
    ...input,
    type: 'income',
    category: 'other',
    amount: 2,
  });
  await repo.updateTransaction(db, { ...input, id, amount: 2 });
  assert.equal(
    (await repo.loadFinance(db)).accounts.find((x) => x.id === a).balance,
    Number.MAX_SAFE_INTEGER,
  );
});

test('overflow on a destination wallet rolls back the original wallet and record', async (t) => {
  const { db, a, b, input, id } = await setup(t);
  await repo.saveAccount(db, {
    id: b,
    name: 'Bank',
    type: 'bank',
    balance: Number.MAX_SAFE_INTEGER,
  });
  const before = await repo.loadFinance(db);
  await assert.rejects(
    repo.updateTransaction(db, {
      ...input,
      id,
      accountId: b,
      type: 'income',
      category: 'other',
    }),
    { code: 'invalidBalance' },
  );
  assert.deepEqual(await repo.loadFinance(db), before);
  assert.equal(
    (await repo.loadFinance(db)).accounts.find((x) => x.id === a).balance,
    950000,
  );
});

test('a failed deletion rolls back the refund', async (t) => {
  const { db, id } = await setup(t);
  const before = await repo.loadFinance(db);
  const original = db.runAsync;
  db.runAsync = async (sql, ...args) => {
    if (sql.includes('UPDATE transactions SET deleted_at'))
      throw new Error('Injected delete failure');
    return original(sql, ...args);
  };
  await assert.rejects(
    repo.deleteTransaction(db, id),
    /Injected delete failure/,
  );
  db.runAsync = original;
  assert.deepEqual(await repo.loadFinance(db), before);
});

test('concurrent deletion is serialized and reverses an income only once', async (t) => {
  const { db, a, input, id } = await setup(t);
  await repo.updateTransaction(db, {
    ...input,
    id,
    type: 'income',
    category: 'other',
    amount: 100000,
  });
  const results = await Promise.allSettled([
    repo.deleteTransaction(db, id),
    repo.deleteTransaction(db, id),
  ]);
  assert.equal(results.filter((x) => x.status === 'fulfilled').length, 1);
  assert.equal(
    (await repo.loadFinance(db)).accounts.find((x) => x.id === a).balance,
    1000000,
  );
});

test('invalid edits and removed/foreign destination wallets leave the ledger unchanged', async (t) => {
  const { db, b, input, id } = await setup(t);
  const before = await repo.loadFinance(db);
  for (const [changes, code] of [
    [{ amount: 0 }, 'invalidAmount'],
    [{ amount: -1 }, 'invalidAmount'],
    [{ amount: 0.5 }, 'invalidAmount'],
    [{ title: ' ' }, 'titleRequired'],
    [{ occurredAt: 'bad' }, 'invalidDate'],
    [{ category: 'unknown' }, 'invalidCategory'],
    [{ type: 'transfer' }, 'unsupportedTransfer'],
    [
      { type: 'income', category: 'salary', salaryMonth: '2026-13' },
      'invalidMonth',
    ],
    [{ type: 'income', category: 'salary', salaryMonth: '' }, 'invalidMonth'],
    [
      {
        type: 'income',
        category: 'salary',
        occurredAt: '2099-01-01T12:00:00Z',
      },
      'futureDate',
    ],
    [{ accountId: 'missing' }, 'accountNotFound'],
  ]) {
    await assert.rejects(
      async () => repo.updateTransaction(db, { ...input, id, ...changes }),
      { code },
    );
    assert.deepEqual(await repo.loadFinance(db), before);
  }
  db.raw
    .prepare("UPDATE accounts SET deleted_at = '2026-01-01' WHERE id = ?")
    .run(b);
  await assert.rejects(
    repo.updateTransaction(db, { ...input, id, accountId: b }),
    { code: 'accountNotFound' },
  );
  db.raw.exec(
    "INSERT INTO profiles (id,device_id,created_at,updated_at) VALUES ('other','device','','')",
  );
  db.raw
    .prepare(
      "UPDATE accounts SET profile_id = 'other', deleted_at = NULL WHERE id = ?",
    )
    .run(b);
  await assert.rejects(
    repo.updateTransaction(db, { ...input, id, accountId: b }),
    { code: 'accountNotFound' },
  );
});

test('changing receipt date moves cash flow between months without changing money', async (t) => {
  const { db, a, input, id } = await setup(t);
  const { summarizeMonth } = loadTypescript(
    'src/shared/utils/financeSummary.ts',
  );
  await repo.updateTransaction(db, {
    ...input,
    id,
    occurredAt: '2026-01-15T05:00:00Z',
  });
  const data = await repo.loadFinance(db);
  assert.equal(summarizeMonth(data.transactions, '2025-12').expense, 0);
  assert.equal(summarizeMonth(data.transactions, '2026-01').expense, 50000);
  assert.equal(data.accounts.find((x) => x.id === a).balance, 950000);
  await repo.deleteTransaction(db, id);
  assert.equal(
    summarizeMonth((await repo.loadFinance(db)).transactions, '2026-01')
      .expense,
    0,
  );
});

async function setup(t) {
  const db = createDatabase();
  t.after(() => db.raw.close());
  await migrateDbIfNeeded(db);
  const a = await repo.saveAccount(db, {
    name: 'Cash',
    type: 'cash',
    balance: 1000000,
  });
  const b = await repo.saveAccount(db, {
    name: 'Bank',
    type: 'bank',
    balance: 2000000,
  });
  const input = {
    accountId: a,
    title: 'Lunch',
    amount: 50000,
    type: 'expense',
    category: 'food',
    categoryIcon: 'food-outline',
    occurredAt: '2025-12-15T05:00:00.000Z',
  };
  await repo.addTransaction(db, input);
  const id = (await repo.loadFinance(db)).transactions[0].id;
  return { db, a, b, input, id };
}

test('editing an expense replaces its balance contribution and keeps identity/baseline', async (t) => {
  const { db, a, input, id } = await setup(t);
  await repo.updateTransaction(db, {
    ...input,
    id,
    amount: 80000,
    title: 'Dinner',
    note: 'Updated',
  });
  let data = await repo.loadFinance(db);
  assert.equal(data.accounts.find((x) => x.id === a).balance, 920000);
  assert.equal(data.transactions[0].id, id);
  assert.equal(data.transactions[0].note, 'Updated');
  assert.equal(
    db.raw.prepare('SELECT opening_balance FROM accounts WHERE id = ?').get(a)
      .opening_balance,
    1000000,
  );
  await repo.updateTransaction(db, { ...input, id, amount: 80000 });
  data = await repo.loadFinance(db);
  assert.equal(data.accounts.find((x) => x.id === a).balance, 920000);
  assert.equal(data.transactions.length, 1);
});

test('changing wallet and direction reverses the old wallet and applies the new contribution', async (t) => {
  const { db, a, b, input, id } = await setup(t);
  await repo.updateTransaction(db, {
    ...input,
    id,
    accountId: b,
    type: 'income',
    category: 'other',
    amount: 100000,
  });
  const data = await repo.loadFinance(db);
  assert.equal(data.accounts.find((x) => x.id === a).balance, 1000000);
  assert.equal(data.accounts.find((x) => x.id === b).balance, 2100000);
});

test('deletion creates a tombstone and cannot change balances twice', async (t) => {
  const { db, a, id } = await setup(t);
  await repo.deleteTransaction(db, id);
  const data = await repo.loadFinance(db);
  assert.equal(data.transactions.length, 0);
  assert.equal(data.accounts.find((x) => x.id === a).balance, 1000000);
  const row = db.raw
    .prepare('SELECT deleted_at, sync_state FROM transactions WHERE id = ?')
    .get(id);
  assert.ok(row.deleted_at);
  assert.equal(row.sync_state, 'pending');
  await assert.rejects(repo.deleteTransaction(db, id), {
    code: 'transactionNotFound',
  });
  assert.deepEqual(await repo.loadFinance(db), data);
});

test('failed editing rolls back both wallets and the transaction', async (t) => {
  const { db, b, input, id } = await setup(t);
  const before = await repo.loadFinance(db);
  const original = db.runAsync;
  db.runAsync = async (sql, ...args) => {
    if (sql.includes('UPDATE transactions SET'))
      throw new Error('Injected edit failure');
    return original(sql, ...args);
  };
  await assert.rejects(
    repo.updateTransaction(db, { ...input, id, accountId: b }),
    /Injected edit failure/,
  );
  db.runAsync = original;
  assert.deepEqual(await repo.loadFinance(db), before);
});

test('salary edits exclude themselves from deduplication and deletion releases their month', async (t) => {
  const { db, a, input } = await setup(t);
  await repo.recordSalary(db, {
    accountId: a,
    title: 'Salary',
    amount: 500000,
    month: '2025-11',
    receivedAt: input.occurredAt,
    includedInBalance: true,
  });
  const row = (await repo.loadFinance(db)).transactions.find(
    (x) => x.category === 'salary',
  );
  await repo.updateTransaction(db, { ...row, amount: 600000 });
  assert.equal(
    (await repo.loadFinance(db)).transactions.find((x) => x.id === row.id)
      .salaryMonth,
    '2025-11',
  );
  assert.equal(
    (await repo.loadFinance(db)).accounts.find((x) => x.id === a).balance,
    1050000,
  );
  await repo.recordSalary(db, {
    accountId: a,
    title: 'Other salary',
    amount: 100000,
    month: '2025-10',
    receivedAt: input.occurredAt,
    includedInBalance: false,
  });
  const before = await repo.loadFinance(db);
  await assert.rejects(
    repo.updateTransaction(db, { ...row, salaryMonth: '2025-10' }),
    { code: 'salaryExists' },
  );
  assert.deepEqual(await repo.loadFinance(db), before);
  await repo.deleteTransaction(db, row.id);
  await repo.recordSalary(db, {
    accountId: a,
    title: 'Replacement salary',
    amount: 500000,
    month: '2025-11',
    receivedAt: input.occurredAt,
    includedInBalance: false,
  });
});

test('imported transactions and foreign or missing records cannot be mutated', async (t) => {
  const { db, input, id } = await setup(t);
  db.raw
    .prepare("UPDATE transactions SET source = 'bank-api' WHERE id = ?")
    .run(id);
  const before = await repo.loadFinance(db);
  await assert.rejects(repo.updateTransaction(db, { ...input, id }), {
    code: 'readOnlyTransaction',
  });
  await assert.rejects(repo.deleteTransaction(db, id), {
    code: 'readOnlyTransaction',
  });
  await assert.rejects(repo.deleteTransaction(db, 'missing'), {
    code: 'transactionNotFound',
  });
  assert.deepEqual(await repo.loadFinance(db), before);
  db.raw.exec(
    "INSERT INTO profiles (id,device_id,created_at,updated_at) VALUES ('other','device','','')",
  );
  db.raw
    .prepare(
      "UPDATE transactions SET profile_id = 'other', source = 'manual' WHERE id = ?",
    )
    .run(id);
  await assert.rejects(repo.updateTransaction(db, { ...input, id }), {
    code: 'transactionNotFound',
  });
});
