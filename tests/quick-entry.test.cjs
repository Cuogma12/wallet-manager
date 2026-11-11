const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTypescript } = require('./helpers/loadTypescript.cjs');
const { createDatabase } = require('./helpers/sqlite.cjs');

const { parseBalanceNotification } = loadTypescript(
  'src/services/imports/parseBalanceNotification.ts',
);
const { buildQuickTransactionTemplates } = loadTypescript(
  'src/features/add-transaction/utils/quickTransaction.ts',
);
const { parseQuickTransactionText } = loadTypescript(
  'src/features/add-transaction/utils/parseQuickTransactionText.ts',
);
const { learnCategoryFromHistory } = loadTypescript(
  'src/features/add-transaction/utils/learnedCategory.ts',
);
const { migrateDbIfNeeded } = loadTypescript('src/db/database.ts');
const finance = loadTypescript('src/db/repositories/financeRepository.ts');

test('notification parser prefers movement over balance and extracts expense metadata offline', () => {
  const text =
    'MBBank | GD: -50,000 VND lúc 09:15 06/11/2026 | SD: 2,000,000 VND | ND: GRABFOOD';
  const parsed = parseBalanceNotification(
    text,
    new Date('2026-11-07T00:00:00.000Z'),
  );
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.amount, 50000);
  assert.equal(parsed.value.type, 'expense');
  assert.equal(parsed.value.category, 'food');
  assert.match(parsed.value.title, /GRABFOOD/i);
  const date = new Date(parsed.value.occurredAt);
  assert.equal(date.getFullYear(), 2026);
  assert.equal(date.getMonth(), 10);
  assert.equal(date.getDate(), 6);
  assert.equal(date.getHours(), 9);
  assert.equal(date.getMinutes(), 15);
  assert.equal(
    parseBalanceNotification(text).value.externalId,
    parsed.value.externalId,
  );
});

test('notification parser handles income and refuses ambiguous or malformed text', () => {
  const income = parseBalanceNotification(
    'VCB Ghi có +1.500.000 VNĐ ngày 05/11/2026. Nội dung: LUONG THANG 10',
  );
  assert.equal(income.ok, true);
  assert.equal(income.value.amount, 1500000);
  assert.equal(income.value.type, 'income');
  assert.match(income.value.title, /LUONG THANG 10/);
  assert.deepEqual(parseBalanceNotification(''), {
    ok: false,
    reason: 'empty',
  });
  assert.deepEqual(parseBalanceNotification('Giao dịch thành công'), {
    ok: false,
    reason: 'amount',
  });
  assert.deepEqual(parseBalanceNotification('Số tiền 50.000 VND'), {
    ok: false,
    reason: 'type',
  });
});

test('natural quick entry parses Vietnamese amounts, categories and relative dates', () => {
  assert.deepEqual(parseQuickTransactionText('ăn trưa 35k'), {
    amount: 35000,
    type: 'expense',
    title: 'Ăn trưa',
    category: 'food',
    date: null,
    normalizedText: 'an trua 35k',
  });
  assert.deepEqual(parseQuickTransactionText('ăn tối hôm qua 40 nghìn'), {
    amount: 40000,
    type: 'expense',
    title: 'Ăn tối',
    category: 'food',
    date: 'yesterday',
    normalizedText: 'an toi hom qua 40 nghin',
  });
  assert.equal(
    parseQuickTransactionText('đổ xăng 100.000').category,
    'transport',
  );
  assert.equal(parseQuickTransactionText('mua áo 350k').category, 'shopping');
});

test('natural quick entry supports income and rejects incomplete phrases', () => {
  const income = parseQuickTransactionText('thưởng 2tr');
  assert.equal(income.amount, 2000000);
  assert.equal(income.type, 'income');
  assert.equal(income.title, 'Thưởng');
  assert.equal(parseQuickTransactionText('freelance 1,5tr').amount, 1500000);
  assert.equal(parseQuickTransactionText('ăn trưa'), null);
  assert.equal(parseQuickTransactionText('35k'), null);
  assert.equal(parseQuickTransactionText('ăn trưa 0k'), null);
});

test('quick entry learns categories from reviewed transaction history', () => {
  const base = {
    accountId: 'cash',
    amount: 250000,
    type: 'expense',
    categoryIcon: '',
    occurredAt: '2026-11-10T00:00:00.000Z',
    source: 'manual',
    isReviewed: true,
  };
  const learned = learnCategoryFromHistory(
    'Nhậu với bạn',
    [
      {
        ...base,
        id: 'meal',
        title: 'Đi nhậu',
        merchant: 'Đi nhậu',
        category: 'food',
      },
      {
        ...base,
        id: 'shopping',
        title: 'Mua áo',
        merchant: 'Mua áo',
        category: 'shopping',
      },
    ],
    ['food', 'shopping'],
  );
  assert.equal(learned.category, 'food');
  assert.ok(learned.confidence >= 0.5);
});

test('category learning ignores uncertain, demo and unrelated transactions', () => {
  const base = {
    accountId: 'cash',
    title: 'Khám mèo',
    merchant: 'Khám mèo',
    amount: 250000,
    type: 'expense',
    category: 'pet',
    categoryIcon: '',
    occurredAt: '2026-11-10T00:00:00.000Z',
    source: 'manual',
    isReviewed: true,
  };
  assert.equal(
    learnCategoryFromHistory('Khám mèo định kỳ', [base], ['pet']).category,
    'pet',
  );
  assert.equal(
    learnCategoryFromHistory(
      'Khám mèo',
      [
        { ...base, id: 'unreviewed', isReviewed: false },
        { ...base, id: 'demo', isDemo: true },
        { ...base, id: 'income', type: 'income' },
      ],
      ['pet'],
    ),
    null,
  );
  assert.equal(
    learnCategoryFromHistory('Đổ xăng', [{ ...base, id: 'pet' }], ['pet']),
    null,
  );
});

test('quick templates exclude unsafe rows and collapse matching transactions', () => {
  const accounts = [{ id: 'cash' }, { id: 'bank' }];
  const base = {
    accountId: 'cash',
    title: 'Cà phê',
    merchant: 'Cà phê',
    amount: 30000,
    type: 'expense',
    category: 'food',
    categoryIcon: '',
    occurredAt: '2026-11-06T00:00:00.000Z',
    source: 'manual',
    isReviewed: true,
  };
  const templates = buildQuickTransactionTemplates(
    [
      { ...base, id: 'new' },
      { ...base, id: 'duplicate' },
      { ...base, id: 'demo', isDemo: true },
      { ...base, id: 'missing-account', accountId: 'missing' },
      { ...base, id: 'missing-category', category: 'category-deleted' },
      { ...base, id: 'salary', type: 'income', category: 'salary' },
      { ...base, id: 'income', type: 'income', category: 'other' },
      { ...base, id: 'bank', accountId: 'bank', title: 'Lunch' },
    ],
    accounts,
    ['food'],
  );
  assert.deepEqual(
    templates.map((item) => item.id),
    ['new', 'income', 'bank'],
  );
  assert.equal(templates[0].usageCount, 2);
});

test('quick templates prioritize frequent transactions and keep their latest amount', () => {
  const accounts = [{ id: 'cash' }];
  const base = {
    accountId: 'cash',
    merchant: '',
    type: 'expense',
    category: 'food',
    categoryIcon: '',
    occurredAt: '2026-11-06T00:00:00.000Z',
    source: 'manual',
    isReviewed: true,
  };
  const templates = buildQuickTransactionTemplates(
    [
      { ...base, id: 'latest-coffee', title: 'Cà phê', amount: 35000 },
      { ...base, id: 'lunch', title: 'Ăn trưa', amount: 50000 },
      { ...base, id: 'old-coffee', title: 'Cà phê', amount: 30000 },
      { ...base, id: 'older-coffee', title: 'Cà phê', amount: 25000 },
    ],
    accounts,
    ['food'],
  );
  assert.equal(templates[0].id, 'latest-coffee');
  assert.equal(templates[0].amount, 35000);
  assert.equal(templates[0].usageCount, 3);
  assert.equal(templates[1].id, 'lunch');
});

test('pasted imports deduplicate but remain editable and removable as local user data', async (t) => {
  const db = createDatabase();
  t.after(() => db.raw.close());
  await migrateDbIfNeeded(db);
  const accountId = await finance.saveAccount(db, {
    name: 'MBBank',
    type: 'bank',
    balance: 1000000,
  });
  const input = {
    accountId,
    title: 'GRABFOOD',
    merchant: 'GRABFOOD',
    amount: 50000,
    type: 'expense',
    category: 'food',
    categoryIcon: '',
    occurredAt: '2026-11-06T09:15:00.000Z',
    source: 'imported',
    externalId: 'pasted-stable',
    isReviewed: true,
  };
  await finance.addTransaction(db, input);
  await assert.rejects(finance.addTransaction(db, input), {
    code: 'duplicateTransaction',
  });
  let data = await finance.loadFinance(db);
  assert.equal(data.transactions.length, 1);
  assert.equal(data.transactions[0].source, 'imported');
  assert.equal(data.transactions[0].externalId, 'pasted-stable');
  assert.equal(data.accounts[0].balance, 950000);
  await finance.updateTransaction(db, {
    ...input,
    id: data.transactions[0].id,
    title: 'Đã kiểm tra',
    amount: 40000,
  });
  data = await finance.loadFinance(db);
  assert.equal(data.transactions[0].title, 'Đã kiểm tra');
  assert.equal(data.transactions[0].externalId, 'pasted-stable');
  assert.equal(data.accounts[0].balance, 960000);
  await finance.deleteTransaction(db, data.transactions[0].id);
  data = await finance.loadFinance(db);
  assert.equal(data.transactions.length, 0);
  assert.equal(data.accounts[0].balance, 1000000);
});
