import type {
  BackupAccount,
  BackupTransaction,
  FinanceBackup,
} from '@/shared/types/backup';
import { getAccountProvider } from '@/shared/constants/accountProviders';
import {
  assertMoney,
  assertMonth,
  FinanceError,
  getMonthKey,
} from '@/shared/utils/financeValidation';

export const MAX_BACKUP_BYTES = 10 * 1024 * 1024;
const MAX_ROWS = 50_000;

function fail(): never {
  throw new FinanceError('invalidBackup');
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail();
  return value as Record<string, unknown>;
}
function string(value: unknown, maximum = 2000): string {
  if (typeof value !== 'string' || value.length > maximum) fail();
  return value;
}
function id(value: unknown) {
  const result = string(value, 128);
  if (!/^[a-zA-Z0-9_-]+$/.test(result)) fail();
  return result;
}
function money(value: unknown, signed = false) {
  if (typeof value !== 'number') fail();
  assertMoney(value, signed);
  return value;
}
function flag(value: unknown): boolean {
  if (typeof value !== 'boolean') fail();
  return value;
}
function date(value: unknown) {
  const result = string(value, 40);
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(result) ||
    !Number.isFinite(new Date(result).getTime()) ||
    new Date(result).toISOString() !== result
  )
    fail();
  return result;
}
function rows(value: unknown) {
  if (!Array.isArray(value) || value.length > MAX_ROWS) fail();
  return value;
}

/** Rebuild allowlisted objects; never accept SQL, owner IDs, auth state or arbitrary fields. */
export function parseBackup(value: unknown): FinanceBackup {
  try {
    const input = record(value);
    if (
      input.format !== 'monee-backup' ||
      input.version !== 1 ||
      input.currency !== 'VND'
    )
      fail();
    const accounts = rows(input.accounts).map((entry): BackupAccount => {
      const row = record(entry);
      if (!['cash', 'bank', 'wallet'].includes(String(row.type))) fail();
      const name = string(row.name, 200).trim();
      if (!name) fail();
      const providerId =
        row.providerId === undefined ? undefined : id(row.providerId);
      const provider = getAccountProvider(providerId);
      if (
        providerId &&
        (row.type === 'cash' || (provider && provider.type !== row.type))
      )
        fail();
      return {
        id: id(row.id),
        name,
        type: row.type as BackupAccount['type'],
        ...(providerId ? { providerId } : {}),
        balance: money(row.balance, true),
        openingBalance: money(row.openingBalance, true),
        isDemo: flag(row.isDemo),
      };
    });
    const accountIds = new Set(accounts.map((row) => row.id));
    if (accountIds.size !== accounts.length) fail();
    const salaryMonths = new Set<string>();
    const externalIds = new Set<string>();
    const transactions = rows(input.transactions).map(
      (entry): BackupTransaction => {
        const row = record(entry);
        const accountId = id(row.accountId);
        if (
          !accountIds.has(accountId) ||
          !['income', 'expense', 'transfer'].includes(String(row.type)) ||
          !['manual', 'imported', 'bank-api'].includes(String(row.source))
        )
          fail();
        const occurredAt = date(row.occurredAt);
        const salaryMonth =
          row.salaryMonth === undefined
            ? undefined
            : string(row.salaryMonth, 7);
        if (salaryMonth !== undefined) {
          assertMonth(salaryMonth);
          if (row.type !== 'income' || row.category !== 'salary') fail();
        }
        const isDemo = flag(row.isDemo);
        const title = string(row.title, 1000).trim();
        if (!title) fail();
        if (!isDemo && row.type === 'income' && row.category === 'salary') {
          const month = salaryMonth ?? getMonthKey(new Date(occurredAt));
          if (salaryMonths.has(month)) fail();
          salaryMonths.add(month);
        }
        const externalId =
          row.externalId === undefined
            ? undefined
            : string(row.externalId, 256);
        if (externalId !== undefined) {
          const key = `${row.source}:${externalId}`;
          if (!externalId || externalIds.has(key)) fail();
          externalIds.add(key);
        }
        return {
          id: id(row.id),
          accountId,
          title,
          merchant: string(row.merchant, 1000),
          amount: money(row.amount),
          type: row.type as BackupTransaction['type'],
          category: string(row.category, 100),
          occurredAt,
          note: row.note === undefined ? undefined : string(row.note, 10000),
          source: row.source as BackupTransaction['source'],
          isReviewed: flag(row.isReviewed),
          salaryMonth,
          isDemo,
          externalId,
        };
      },
    );
    if (new Set(transactions.map((row) => row.id)).size !== transactions.length)
      fail();
    const balances = new Map(
      accounts.map((row) => [row.id, BigInt(row.openingBalance)]),
    );
    for (const tx of transactions) {
      const delta =
        tx.type === 'income'
          ? BigInt(tx.amount)
          : tx.type === 'expense'
            ? -BigInt(tx.amount)
            : 0n;
      balances.set(tx.accountId, balances.get(tx.accountId)! + delta);
    }
    if (accounts.some((row) => balances.get(row.id) !== BigInt(row.balance)))
      fail();
    const settings = record(input.settings);
    const salaryDay = money(settings.salaryDay);
    const monthlyIncome = money(settings.monthlyIncome, true);
    if (salaryDay > 31 || monthlyIncome < 0) fail();
    return {
      format: 'monee-backup',
      version: 1,
      currency: 'VND',
      createdAt: date(input.createdAt),
      accounts,
      transactions,
      settings: {
        initialBalance: money(settings.initialBalance, true),
        monthlyIncome,
        salaryDay,
      },
    };
  } catch {
    return fail();
  }
}

export function parseBackupText(text: string): FinanceBackup {
  if (text.length > MAX_BACKUP_BYTES) throw new FinanceError('backupTooLarge');
  try {
    return parseBackup(JSON.parse(text));
  } catch {
    return fail();
  }
}
