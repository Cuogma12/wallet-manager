const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTypescript } = require('./helpers/loadTypescript.cjs');
const { createDatabase } = require('./helpers/sqlite.cjs');
const { getCalendarWeeks, getCalendarMonth, resolveTransactionDate } =
  loadTypescript('src/features/add-transaction/utils/transactionDate.ts');
const { formatInputDate, getMonthKey } = loadTypescript(
  'src/shared/utils/financeValidation.ts',
);

test('calendar starts Monday, has complete weeks and includes each real date once', () => {
  const weeks = getCalendarWeeks('2026-02'); // February 1 is a Sunday.
  assert.equal(weeks[0][0], null);
  assert.equal(weeks[0][6], '01/02/2026');
  assert.equal(weeks.length, 5);
  assert.ok(weeks.every((week) => week.length === 7));
  const dates = weeks.flat().filter(Boolean);
  assert.equal(dates.length, 28);
  assert.equal(new Set(dates).size, 28);
  assert.equal(dates.at(-1), '28/02/2026');
  assert.equal(getCalendarWeeks('2024-02').flat().filter(Boolean).length, 29);
  assert.equal(getCalendarWeeks('2026-03').length, 6);
  assert.equal(
    getCalendarWeeks('1900-01').flat().filter(Boolean)[0],
    '01/01/1900',
  );
  assert.equal(
    getCalendarWeeks('9999-12').flat().filter(Boolean).at(-1),
    '31/12/9999',
  );
  assert.throws(() => getCalendarWeeks('2026-13'), { code: 'invalidMonth' });
});

test('calendar follows a valid typed date, falling back to today for incomplete/invalid text', () => {
  const now = new Date(2026, 0, 1, 0, 5);
  assert.equal(getCalendarMonth('31/12/2025', now), '2025-12');
  assert.equal(getCalendarMonth('29/02/2024', now), '2024-02');
  for (const value of ['', '31/02/2026', '1/1/2026', 'not-a-date'])
    assert.equal(getCalendarMonth(value, now), '2026-01');
});

test('today keeps the save instant; chosen days use local noon without UTC month drift', () => {
  const now = new Date(2026, 0, 1, 0, 5, 12, 123);
  assert.equal(
    resolveTransactionDate(formatInputDate(now), now),
    now.toISOString(),
  );
  const selected = new Date(resolveTransactionDate('31/12/2025', now));
  assert.equal(formatInputDate(selected), '31/12/2025');
  assert.equal(selected.getHours(), 12);
  assert.equal(getMonthKey(selected), '2025-12');
  assert.equal(
    formatInputDate(new Date(resolveTransactionDate('29/02/2024', now))),
    '29/02/2024',
  );
  for (const value of [
    '',
    '31/02/2026',
    '29/02/2025',
    '2026-01-01',
    '01/01/1899',
  ])
    assert.throws(() => resolveTransactionDate(value, now), {
      code: 'invalidDate',
    });
});

test('backdated expense/income persist in their selected reporting month with exact wallet movement', async (t) => {
  const { migrateDbIfNeeded } = loadTypescript('src/db/database.ts');
  const repo = loadTypescript('src/db/repositories/financeRepository.ts');
  const db = createDatabase();
  t.after(() => db.raw.close());
  await migrateDbIfNeeded(db);
  const accountId = await repo.saveAccount(db, {
    name: 'Test dates',
    type: 'cash',
    balance: 1000000,
  });
  for (const [date, type, amount] of [
    ['31/12/2025', 'expense', 50000],
    ['01/01/2026', 'income', 200000],
  ]) {
    await repo.addTransaction(db, {
      accountId,
      title: type,
      amount,
      type,
      category: 'other',
      categoryIcon: '',
      occurredAt: resolveTransactionDate(date),
    });
  }
  await migrateDbIfNeeded(db);
  const data = await repo.loadFinance(db);
  assert.equal(data.accounts[0].balance, 1150000);
  assert.equal(data.transactions.length, 2);
  assert.equal(
    getMonthKey(
      new Date(
        data.transactions.find((row) => row.type === 'expense').occurredAt,
      ),
    ),
    '2025-12',
  );
  assert.equal(
    getMonthKey(
      new Date(
        data.transactions.find((row) => row.type === 'income').occurredAt,
      ),
    ),
    '2026-01',
  );
});
