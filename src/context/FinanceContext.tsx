import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { LOCAL_PROFILE_ID } from '@/db/constants';
import { createClientId } from '@/db/ids';
import { getCategoryIcon } from '@/shared/constants/categories';
import type {
  Account,
  FinanceSettings,
  NewTransaction,
  Transaction,
} from '@/shared/types/finance';

type FinanceContextValue = {
  accounts: Account[];
  transactions: Transaction[];
  settings: FinanceSettings | null;
  isReady: boolean;
  addTransaction: (input: NewTransaction) => Promise<void>;
  refresh: () => Promise<void>;
};

type AccountRow = Omit<Account, 'syncStatus'> & { sync_status: Account['syncStatus'] };
type TransactionRow = Omit<Transaction, 'accountId' | 'categoryIcon' | 'occurredAt' | 'isReviewed'> & {
  account_id: string;
  occurred_at: string;
  is_reviewed: number;
};

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<FinanceSettings | null>(null);
  const [isReady, setIsReady] = useState(false);

  const refresh = useCallback(async () => {
    const [accountRows, transactionRows, settingRow] = await Promise.all([
      db.getAllAsync<AccountRow>(
        'SELECT id, name, type, balance, icon, color, sync_status FROM accounts WHERE profile_id = ? AND deleted_at IS NULL ORDER BY name',
        LOCAL_PROFILE_ID,
      ),
      db.getAllAsync<TransactionRow>(
        'SELECT id, account_id, title, merchant, amount, type, category, occurred_at, note, source, is_reviewed FROM transactions WHERE profile_id = ? AND deleted_at IS NULL ORDER BY occurred_at DESC',
        LOCAL_PROFILE_ID,
      ),
      db.getFirstAsync<{
        initial_balance: number;
        monthly_income: number;
        salary_day: number;
      }>(
        'SELECT initial_balance, monthly_income, salary_day FROM settings WHERE profile_id = ?',
        LOCAL_PROFILE_ID,
      ),
    ]);

    setAccounts(
      accountRows.map((row) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        balance: row.balance,
        icon: row.icon,
        color: row.color,
        syncStatus: row.sync_status,
      })),
    );
    setTransactions(
      transactionRows.map((row) => ({
        id: row.id,
        accountId: row.account_id,
        title: row.title,
        merchant: row.merchant,
        amount: row.amount,
        type: row.type,
        category: row.category,
        categoryIcon: getCategoryIcon(row.category),
        occurredAt: row.occurred_at,
        note: row.note,
        source: row.source,
        isReviewed: row.is_reviewed === 1,
      })),
    );
    setSettings(
      settingRow
        ? {
            initialBalance: settingRow.initial_balance,
            monthlyIncome: settingRow.monthly_income,
            salaryDay: settingRow.salary_day,
          }
        : null,
    );
    setIsReady(true);
  }, [db]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  const addTransaction = useCallback(
    async (input: NewTransaction) => {
      const timestamp = new Date().toISOString();
      const id = createClientId('tx');
      const accountDelta = input.type === 'income' ? input.amount : -input.amount;

      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `INSERT INTO transactions
            (id, profile_id, account_id, title, merchant, amount, type, category, occurred_at, note, source, is_reviewed, external_id, sync_state, created_at, updated_at, deleted_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual', 1, NULL, 'pending', ?, ?, NULL)`,
          id,
          LOCAL_PROFILE_ID,
          input.accountId,
          input.title,
          input.title,
          input.amount,
          input.type,
          input.category,
          input.occurredAt,
          input.note ?? null,
          timestamp,
          timestamp,
        );
        await db.runAsync(
          'UPDATE accounts SET balance = balance + ?, updated_at = ?, sync_state = \'pending\' WHERE id = ? AND profile_id = ?',
          accountDelta,
          timestamp,
          input.accountId,
          LOCAL_PROFILE_ID,
        );
      });

      await refresh();
    },
    [db, refresh],
  );

  const value = useMemo(
    () => ({ accounts, transactions, settings, isReady, addTransaction, refresh }),
    [accounts, transactions, settings, isReady, addTransaction, refresh],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used inside FinanceProvider');
  }
  return context;
}
