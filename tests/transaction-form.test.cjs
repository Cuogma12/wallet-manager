const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTypescript } = require('./helpers/loadTypescript.cjs');
const { initialTransactionFields, buildTransactionUpdate } = loadTypescript(
  'src/features/transaction-detail/utils/transactionForm.ts',
);

const transaction = {
  id: 'tx',
  accountId: 'wallet',
  amount: 100000,
  type: 'income',
  category: 'salary',
  title: 'Salary',
  occurredAt: '2025-12-31T17:30:00.000Z',
  salaryMonth: '2025-12',
  source: 'manual',
  note: 'Original',
};

test('editing text preserves the exact receipt instant and independent salary period', () => {
  const fields = initialTransactionFields(transaction);
  const update = buildTransactionUpdate(transaction, {
    ...fields,
    title: 'Updated',
    amount: '1.200.000',
  });
  assert.equal(update.id, transaction.id);
  assert.equal(update.occurredAt, transaction.occurredAt);
  assert.equal(update.salaryMonth, '2025-12');
  assert.equal(update.amount, 1200000);
  assert.equal(update.note, 'Original');
});

test('changing the date parses a real local date and rejects impossible calendar dates', () => {
  const fields = initialTransactionFields(transaction);
  const update = buildTransactionUpdate(transaction, {
    ...fields,
    date: '29/02/2024',
  });
  assert.equal(new Date(update.occurredAt).getDate(), 29);
  assert.equal(new Date(update.occurredAt).getMonth(), 1);
  assert.throws(
    () =>
      buildTransactionUpdate(transaction, { ...fields, date: '31/02/2026' }),
    { code: 'invalidDate' },
  );
});
