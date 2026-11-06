import type {
  AccountType,
  TransactionType,
  Transaction,
  FinanceSettings,
} from '@/shared/types/finance';
import type { Budget } from '@/shared/types/budget';
import type { CustomCategory } from '@/shared/types/category';

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
  version: 1 | 2 | 3;
  currency: 'VND';
  createdAt: string;
  accounts: BackupAccount[];
  transactions: BackupTransaction[];
  settings: FinanceSettings;
  /** Required in v2; absent in legacy v1 backups. */
  budgets?: Budget[];
  /** Required in v3; absent in legacy v1/v2 backups. */
  customCategories?: CustomCategory[];
};
