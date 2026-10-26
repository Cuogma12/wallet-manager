export type AccountType = 'cash' | 'bank' | 'wallet';
export type TransactionType = 'expense' | 'income' | 'transfer';

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  providerId?: string;
  balance: number;
  icon: string;
  color: string;
  syncStatus: 'local' | 'connected' | 'needs-review';
  isDemo?: boolean;
};

export type Transaction = {
  id: string;
  accountId: string;
  title: string;
  merchant: string;
  amount: number;
  type: TransactionType;
  category: string;
  categoryIcon: string;
  occurredAt: string;
  note?: string;
  source: 'manual' | 'imported' | 'bank-api';
  isReviewed: boolean;
  salaryMonth?: string;
  isDemo?: boolean;
};

export type FinanceSettings = {
  initialBalance: number;
  monthlyIncome: number;
  salaryDay: number;
};

export type NewTransaction = {
  accountId: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  categoryIcon: string;
  occurredAt: string;
  note?: string;
};

export type SaveAccount = {
  id?: string;
  name: string;
  type: AccountType;
  balance: number;
  /** Omitted: retain the existing provider for the same type. Null: choose Other. */
  providerId?: string | null;
};

export type UpdateTransaction = NewTransaction & {
  id: string;
  salaryMonth?: string;
};

export type NewSalary = {
  accountId: string;
  amount: number;
  month: string;
  receivedAt: string;
  title: string;
  includedInBalance: boolean;
};
