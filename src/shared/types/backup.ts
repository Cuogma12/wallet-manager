import type {
  AccountType,
  TransactionType,
  Transaction,
  FinanceSettings,
} from '@/shared/types/finance';

export type BackupAccount = {
  id: string;
  name: string;
  type: AccountType;
  providerId?: string;
  balance: number;
  openingBalance: number;
  isDemo: boolean;
};

export type BackupTransaction = {
  id: string;
  accountId: string;
  title: string;
  merchant: string;
  amount: number;
  type: TransactionType;
  category: string;
  occurredAt: string;
  note?: string;
  source: Transaction['source'];
  isReviewed: boolean;
  salaryMonth?: string;
  isDemo: boolean;
  externalId?: string;
};

export type FinanceBackup = {
  format: 'monee-backup';
  version: 1;
  currency: 'VND';
  createdAt: string;
  accounts: BackupAccount[];
  transactions: BackupTransaction[];
  settings: FinanceSettings;
};
