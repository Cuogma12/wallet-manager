import { LOCAL_PROFILE_ID } from '@/db/constants';
import { createClientId } from '@/db/ids';
import {
  serializeDatabase,
  writeDatabase,
  type FinanceDatabase,
} from '@/db/operations';
import { accountTypes } from '@/shared/constants/accountTypes';
import { getAccountProvider } from '@/shared/constants/accountProviders';
import {
  expenseCategories,
  getCategoryIcon,
} from '@/shared/constants/categories';
import {
  assertMoney,
  adjustBalance,
  assertMonth,
  FinanceError,
  getMonthKey,
} from '@/shared/utils/financeValidation';
import type {
  Account,
  FinanceSettings,
  NewSalary,
  NewTransaction,
  SaveAccount,
  Transaction,
  UpdateTransaction,
} from '@/shared/types/finance';

type AccountRow = {
  id: string;
  name: string;
  type: Account['type'];
  balance: number;
  icon: string;
  color: string;
  sync_status: Account['syncStatus'];
  is_demo: number;
  provider_id: string | null;
};
type TransactionRow = {
  id: string;
  account_id: string;
  title: string;
  merchant: string;
  amount: number;
  type: Transaction['type'];
  category: string;
  occurred_at: string;
  note: string | null;
  source: Transaction['source'];
  is_reviewed: number;
  salary_month: string | null;
  is_demo: number;
};

export function loadFinance(db: FinanceDatabase) {
  return serializeDatabase(db, async () => {
    const [rows, transactions, settings] = await Promise.all([
      db.getAllAsync<AccountRow>(
        'SELECT * FROM accounts WHERE profile_id = ? AND deleted_at IS NULL ORDER BY name',
        LOCAL_PROFILE_ID,
      ),
      db.getAllAsync<TransactionRow>(
        'SELECT * FROM transactions WHERE profile_id = ? AND deleted_at IS NULL ORDER BY occurred_at DESC',
        LOCAL_PROFILE_ID,
      ),
      db.getFirstAsync<{
        initial_balance: number;
        monthly_income: number;
        salary_day: number;
      }>('SELECT * FROM settings WHERE profile_id = ?', LOCAL_PROFILE_ID),
    ]);
    return {
      accounts: rows.map((row): Account => ({
        id: row.id,
        name: row.name,
        type: row.type,
        providerId: row.provider_id ?? undefined,
        balance: row.balance,
        icon: row.icon,
        color: row.color,
        syncStatus: row.sync_status,
        isDemo: row.is_demo === 1,
      })),
      transactions: transactions.map((row): Transaction => ({
        id: row.id,
        accountId: row.account_id,
        title: row.title,
        merchant: row.merchant,
        amount: row.amount,
        type: row.type,
        category: row.category,
        categoryIcon: getCategoryIcon(row.category),
        occurredAt: row.occurred_at,
        note: row.note ?? undefined,
        source: row.source,
        isReviewed: row.is_reviewed === 1,
        salaryMonth: row.salary_month ?? undefined,
        isDemo: row.is_demo === 1,
      })),
      settings: settings
        ? ({
            initialBalance: settings.initial_balance,
            monthlyIncome: settings.monthly_income,
            salaryDay: settings.salary_day,
          } satisfies FinanceSettings)
        : null,
    };
  });
}

async function requireAccount(db: FinanceDatabase, id: string) {
  if (!id) throw new FinanceError('accountRequired');
  const account = await db.getFirstAsync<{ balance: number }>(
    'SELECT balance FROM accounts WHERE id = ? AND profile_id = ? AND deleted_at IS NULL',
    id,
    LOCAL_PROFILE_ID,
  );
  if (!account) throw new FinanceError('accountNotFound');
  return account;
}

async function transactionDelta(db: FinanceDatabase, accountId: string) {
  const row = await db.getFirstAsync<{ delta: number }>(
    `SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount WHEN type = 'expense' THEN -amount ELSE 0 END), 0) AS delta
     FROM transactions WHERE account_id = ? AND profile_id = ? AND deleted_at IS NULL`,
    accountId,
    LOCAL_PROFILE_ID,
  );
  return row?.delta ?? 0;
}

export async function saveAccount(db: FinanceDatabase, input: SaveAccount) {
  if (!input.name.trim()) throw new FinanceError('nameRequired');
  assertMoney(input.balance, true);
  const metadata = accountTypes.find((item) => item.type === input.type);
  if (!metadata) throw new FinanceError('accountRequired');
  return writeDatabase(db, async (tx) => {
    const timestamp = new Date().toISOString();
    const id = input.id ?? createClientId('account');
    if (input.id) await requireAccount(tx, id);
    const existing = input.id
      ? await tx.getFirstAsync<{
          type: Account['type'];
          provider_id: string | null;
        }>(
          'SELECT type, provider_id FROM accounts WHERE id = ? AND profile_id = ?',
          id,
          LOCAL_PROFILE_ID,
        )
      : null;
    const providerId =
      input.providerId === undefined
        ? existing?.type === input.type
          ? existing.provider_id
          : null
        : input.providerId;
    const provider = getAccountProvider(providerId);
    // Unknown IDs from a newer backup may be retained, but not newly assigned.
    const retainedUnknown =
      providerId &&
      !provider &&
      existing?.type === input.type &&
      existing.provider_id === providerId;
    if (
      providerId !== null &&
      (!provider || provider.type !== input.type) &&
      !retainedUnknown
    )
      throw new FinanceError('invalidAccountProvider');
    if (input.type === 'cash' && providerId !== null)
      throw new FinanceError('invalidAccountProvider');
    if (input.id) {
      const openingBalance = input.balance - (await transactionDelta(tx, id));
      assertMoney(openingBalance, true);
      await tx.runAsync(
        `UPDATE accounts SET name = ?, type = ?, balance = ?, opening_balance = ?, icon = ?, color = ?, provider_id = ?,
         is_demo = 0, sync_status = 'local', sync_state = 'pending', updated_at = ? WHERE id = ? AND profile_id = ?`,
        input.name.trim(),
        input.type,
        input.balance,
        openingBalance,
        metadata.icon,
        metadata.color,
        providerId,
        timestamp,
        id,
        LOCAL_PROFILE_ID,
      );
    } else {
      await tx.runAsync(
        `INSERT INTO accounts (id, profile_id, name, type, balance, opening_balance, icon, color, provider_id,
         sync_status, sync_state, created_at, updated_at, is_demo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'local', 'pending', ?, ?, 0)`,
        id,
        LOCAL_PROFILE_ID,
        input.name.trim(),
        input.type,
        input.balance,
        input.balance,
        metadata.icon,
        metadata.color,
        providerId,
        timestamp,
        timestamp,
      );
    }
    return id;
  });
}

async function assertSalaryAvailable(
  db: FinanceDatabase,
  month: string,
  excludedId = '',
) {
  // Also catch legacy manual salaries without salary_month, using local calendar boundaries.
  const [year, number] = month.split('-').map(Number);
  const start = new Date(year, number - 1, 1).toISOString();
  const end = new Date(year, number, 1).toISOString();
  const existing = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM transactions WHERE profile_id = ? AND id != ? AND deleted_at IS NULL AND is_demo = 0
     AND (salary_month = ? OR (salary_month IS NULL AND category = 'salary' AND type = 'income' AND occurred_at >= ? AND occurred_at < ?)) LIMIT 1`,
    LOCAL_PROFILE_ID,
    excludedId,
    month,
    start,
    end,
  );
  if (existing) throw new FinanceError('salaryExists');
}

async function insertTransaction(
  db: FinanceDatabase,
  input: NewTransaction,
  salaryMonth: string | null,
  includedInBalance: boolean,
) {
  const account = await requireAccount(db, input.accountId);
  const timestamp = new Date().toISOString();
  const delta = input.type === 'income' ? input.amount : -input.amount;
  assertMoney(account.balance + (includedInBalance ? 0 : delta), true);
  await db.runAsync(
    `INSERT INTO transactions
      (id, profile_id, account_id, title, merchant, amount, type, category, occurred_at, note, source,
       is_reviewed, sync_state, created_at, updated_at, salary_month, is_demo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual', 1, 'pending', ?, ?, ?, 0)`,
    createClientId('tx'),
    LOCAL_PROFILE_ID,
    input.accountId,
    input.title.trim(),
    input.title.trim(),
    input.amount,
    input.type,
    input.category,
    input.occurredAt,
    input.note ?? null,
    timestamp,
    timestamp,
    salaryMonth,
  );
  if (includedInBalance) {
    const current = await db.getFirstAsync<{ opening_balance: number }>(
      'SELECT opening_balance FROM accounts WHERE id = ? AND profile_id = ?',
      input.accountId,
      LOCAL_PROFILE_ID,
    );
    assertMoney((current?.opening_balance ?? 0) - delta, true);
  }
  await db.runAsync(
    `UPDATE accounts SET balance = balance + ?, opening_balance = opening_balance - ?, updated_at = ?,
     sync_state = 'pending' WHERE id = ? AND profile_id = ?`,
    includedInBalance ? 0 : delta,
    includedInBalance ? delta : 0,
    timestamp,
    input.accountId,
    LOCAL_PROFILE_ID,
  );
}

function validateTransaction(input: NewTransaction) {
  assertMoney(input.amount);
  if (!input.title.trim()) throw new FinanceError('titleRequired');
  if (input.type !== 'income' && input.type !== 'expense')
    throw new FinanceError('unsupportedTransfer');
  if (!Number.isFinite(new Date(input.occurredAt).getTime()))
    throw new FinanceError('invalidDate');
  if (
    !expenseCategories.some((item) => item.key === input.category) &&
    !(input.type === 'income' && input.category === 'salary')
  )
    throw new FinanceError('invalidCategory');
}

async function requireEditableTransaction(db: FinanceDatabase, id: string) {
  const row = await db.getFirstAsync<TransactionRow>(
    'SELECT * FROM transactions WHERE id = ? AND profile_id = ? AND deleted_at IS NULL',
    id,
    LOCAL_PROFILE_ID,
  );
  if (!row) throw new FinanceError('transactionNotFound');
  if (row.source !== 'manual') throw new FinanceError('readOnlyTransaction');
  if (row.type === 'transfer') throw new FinanceError('unsupportedTransfer');
  return row;
}

/** Replaces the old contribution, never rebases opening balances or creates a second record. */
export function updateTransaction(
  db: FinanceDatabase,
  input: UpdateTransaction,
) {
  validateTransaction(input);
  return writeDatabase(db, async (tx) => {
    const old = await requireEditableTransaction(tx, input.id);
    const salaryMonth =
      input.type === 'income' && input.category === 'salary'
        ? (input.salaryMonth ??
          (old.category === 'salary' ? old.salary_month : null) ??
          getMonthKey(new Date(input.occurredAt)))
        : null;
    if (salaryMonth !== null) {
      assertMonth(salaryMonth);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      if (new Date(input.occurredAt) > endOfToday)
        throw new FinanceError('futureDate');
      await assertSalaryAvailable(tx, salaryMonth, old.id);
    }
    const oldAccount = await requireAccount(tx, old.account_id);
    const newAccount = await requireAccount(tx, input.accountId);
    const oldDelta = old.type === 'income' ? old.amount : -old.amount;
    const newDelta = input.type === 'income' ? input.amount : -input.amount;
    const timestamp = new Date().toISOString();
    const balances =
      old.account_id === input.accountId
        ? [
            [
              old.account_id,
              adjustBalance(oldAccount.balance, oldDelta, newDelta),
            ] as const,
          ]
        : [
            [
              old.account_id,
              adjustBalance(oldAccount.balance, oldDelta),
            ] as const,
            [
              input.accountId,
              adjustBalance(newAccount.balance, 0, newDelta),
            ] as const,
          ];
    for (const [accountId, balance] of balances) {
      assertMoney(balance, true);
      await tx.runAsync(
        "UPDATE accounts SET balance = ?, updated_at = ?, sync_state = 'pending' WHERE id = ? AND profile_id = ?",
        balance,
        timestamp,
        accountId,
        LOCAL_PROFILE_ID,
      );
    }
    await tx.runAsync(
      `UPDATE transactions SET account_id = ?, title = ?, merchant = ?, amount = ?, type = ?, category = ?,
       occurred_at = ?, note = ?, salary_month = ?, is_demo = 0, sync_state = 'pending', updated_at = ?
       WHERE id = ? AND profile_id = ?`,
      input.accountId,
      input.title.trim(),
      input.title.trim(),
      input.amount,
      input.type,
      input.category,
      new Date(input.occurredAt).toISOString(),
      input.note?.trim() || null,
      salaryMonth,
      timestamp,
      old.id,
      LOCAL_PROFILE_ID,
    );
  });
}

/** Tombstones are retained for future synchronization; a repeated delete cannot refund twice. */
export function deleteTransaction(db: FinanceDatabase, id: string) {
  return writeDatabase(db, async (tx) => {
    const old = await requireEditableTransaction(tx, id);
    const account = await requireAccount(tx, old.account_id);
    const balance = adjustBalance(
      account.balance,
      old.type === 'income' ? old.amount : -old.amount,
    );
    assertMoney(balance, true);
    const timestamp = new Date().toISOString();
    await tx.runAsync(
      "UPDATE accounts SET balance = ?, updated_at = ?, sync_state = 'pending' WHERE id = ? AND profile_id = ?",
      balance,
      timestamp,
      old.account_id,
      LOCAL_PROFILE_ID,
    );
    await tx.runAsync(
      "UPDATE transactions SET deleted_at = ?, updated_at = ?, sync_state = 'pending' WHERE id = ? AND profile_id = ?",
      timestamp,
      timestamp,
      old.id,
      LOCAL_PROFILE_ID,
    );
  });
}

export function addTransaction(db: FinanceDatabase, input: NewTransaction) {
  validateTransaction(input);
  const month =
    input.type === 'income' && input.category === 'salary'
      ? getMonthKey(new Date(input.occurredAt))
      : null;
  return writeDatabase(db, async (tx) => {
    if (month) await assertSalaryAvailable(tx, month);
    await insertTransaction(tx, input, month, false);
  });
}

export function recordSalary(db: FinanceDatabase, input: NewSalary) {
  assertMonth(input.month);
  const date = new Date(input.receivedAt);
  if (!Number.isFinite(date.getTime())) throw new FinanceError('invalidDate');
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date > today) throw new FinanceError('futureDate');
  const transaction: NewTransaction = {
    accountId: input.accountId,
    title: input.title,
    amount: input.amount,
    type: 'income',
    category: 'salary',
    categoryIcon: getCategoryIcon('salary'),
    occurredAt: input.receivedAt,
  };
  validateTransaction(transaction);
  return writeDatabase(db, async (tx) => {
    await assertSalaryAvailable(tx, input.month);
    await insertTransaction(
      tx,
      transaction,
      input.month,
      input.includedInBalance,
    );
  });
}

/** Only explicitly tagged demo rows are removed. No DELETE/reset of the user's database. */
export function clearDemoData(db: FinanceDatabase) {
  return writeDatabase(db, async (tx) => {
    const timestamp = new Date().toISOString();
    const affected = await tx.getAllAsync<{
      id: string;
      is_demo: number;
      balance: number;
    }>(
      `SELECT id, is_demo, balance FROM accounts WHERE profile_id = ? AND deleted_at IS NULL AND
       (is_demo = 1 OR id IN (SELECT account_id FROM transactions WHERE profile_id = ? AND is_demo = 1 AND deleted_at IS NULL))`,
      LOCAL_PROFILE_ID,
      LOCAL_PROFILE_ID,
    );
    await tx.runAsync(
      "UPDATE transactions SET deleted_at = ?, updated_at = ?, sync_state = 'pending' WHERE profile_id = ? AND is_demo = 1 AND deleted_at IS NULL",
      timestamp,
      timestamp,
      LOCAL_PROFILE_ID,
    );
    for (const account of affected) {
      const count = await tx.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) AS count FROM transactions WHERE profile_id = ? AND account_id = ? AND deleted_at IS NULL',
        LOCAL_PROFILE_ID,
        account.id,
      );
      const delta = await transactionDelta(tx, account.id);
      // Untouched demo wallets retain only real movement. Edited wallets retain the user's stated balance.
      const balance = account.is_demo ? delta : account.balance;
      const openingBalance = account.is_demo ? 0 : balance - delta;
      assertMoney(balance, true);
      assertMoney(openingBalance, true);
      await tx.runAsync(
        `UPDATE accounts SET balance = ?, opening_balance = ?, is_demo = 0, sync_status = 'local',
         deleted_at = ?, updated_at = ?, sync_state = 'pending' WHERE id = ? AND profile_id = ?`,
        balance,
        openingBalance,
        account.is_demo && !count?.count ? timestamp : null,
        timestamp,
        account.id,
        LOCAL_PROFILE_ID,
      );
    }
  });
}

/** Irreversible local reset, invoked only after explicit in-app confirmation. */
export function resetFinancialData(db: FinanceDatabase) {
  return writeDatabase(db, async (tx) => {
    await tx.runAsync(
      'DELETE FROM transactions WHERE profile_id = ?',
      LOCAL_PROFILE_ID,
    );
    await tx.runAsync(
      'DELETE FROM accounts WHERE profile_id = ?',
      LOCAL_PROFILE_ID,
    );
    await tx.runAsync(
      'UPDATE settings SET initial_balance = 0, monthly_income = 0, salary_day = 1, updated_at = ? WHERE profile_id = ?',
      new Date().toISOString(),
      LOCAL_PROFILE_ID,
    );
  });
}
