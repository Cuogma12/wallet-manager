export type AccountType = 'cash' | 'bank' | 'wallet';
export type TransactionType = 'expense' | 'income' | 'transfer';

export type Account = {
  id: string;
  name: string;
  type: AccountType;
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
};

export type NewSalary = {
  accountId: string;
  amount: number;
  month: string;
  receivedAt: string;
  title: string;
  includedInBalance: boolean;
};
