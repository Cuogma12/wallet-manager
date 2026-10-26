const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTypescript } = require('./helpers/loadTypescript.cjs');

const tx = (id, type, amount, occurredAt, extra = {}) => ({
  id,
  type,
  amount,
  occurredAt,
  ...extra,
});
const summary = () => loadTypescript('src/shared/utils/financeSummary.ts');

test('monthly summary uses receipt dates, ignores transfers, and sorts recent transactions', () => {
  const { summarizeMonth } = summary();
  const rows = [
    tx('expense', 'expense', 50000, '2026-01-02T12:00:00+07:00'),
    tx('salary', 'income', 100000, '2026-01-03T12:00:00+07:00', {
      salaryMonth: '2025-12',
    }),
    tx('old', 'expense', 999999, '2025-12-30T12:00:00+07:00'),
    tx('move', 'transfer', 1000000, '2026-01-04T12:00:00+07:00'),
  ];
  const result = summarizeMonth(rows, '2026-01', new Date(2026, 0, 5, 12));
  assert.equal(result.income, 100000);
  assert.equal(result.expense, 50000);
  assert.equal(result.net, 50000);
  assert.deepEqual(
    result.transactions.map((x) => x.id),
    ['move', 'salary', 'expense'],
  );
  assert.deepEqual(
    rows.map((x) => x.id),
    ['expense', 'salary', 'old', 'move'],
  );
});

test('empty months have zero totals and zero chart bars, never sample data', () => {
  const result = summary().summarizeMonth([], '2024-02', new Date(2026, 0, 5));
  assert.equal(result.income, 0);
  assert.equal(result.expense, 0);
  assert.equal(result.net, 0);
  assert.equal(result.dailyExpenses.length, 7);
  assert.equal(result.dailyExpenses[6].day, '2024-02-29');
  assert.ok(result.dailyExpenses.every((x) => x.amount === 0));
});

test('chart clips to the selected month and includes only expenses up to its anchor day', () => {
  const rows = [
    tx('first', 'expense', 10, new Date(2026, 0, 1, 12).toISOString()),
    tx('today', 'expense', 20, new Date(2026, 0, 2, 12).toISOString()),
    tx('tomorrow', 'expense', 40, new Date(2026, 0, 3, 12).toISOString()),
    tx('income', 'income', 100, new Date(2026, 0, 2, 12).toISOString()),
  ];
  const result = summary().summarizeMonth(
    rows,
    '2026-01',
    new Date(2026, 0, 2, 12),
  );
  assert.deepEqual(
    result.dailyExpenses.map((x) => x.amount),
    [10, 20],
  );
  assert.equal(result.expense, 70);
});

test('month boundaries follow local calendar rather than UTC and reject invalid months', (t) => {
  const previous = process.env.TZ;
  process.env.TZ = 'Asia/Bangkok';
  t.after(() => {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  });
  const rows = [
    tx('before', 'expense', 1, '2025-12-31T16:59:59.999Z'),
    tx('after', 'expense', 2, '2025-12-31T17:00:00.000Z'),
  ];
  const { summarizeMonth } = summary();
  assert.equal(summarizeMonth(rows, '2026-01').expense, 2);
  assert.equal(summarizeMonth(rows, '2025-12').expense, 1);
  assert.throws(() => summarizeMonth(rows, '2026-13'), {
    code: 'invalidMonth',
  });
});
