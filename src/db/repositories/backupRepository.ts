import { LOCAL_PROFILE_ID } from '@/db/constants';
import {
  serializeDatabase,
  writeDatabase,
  type FinanceDatabase,
} from '@/db/operations';
import { accountTypes } from '@/shared/constants/accountTypes';
import { parseBackup } from '@/shared/utils/backupValidation';
import { FinanceError } from '@/shared/utils/financeValidation';
import type {
  BackupAccount,
  BackupTransaction,
  FinanceBackup,
} from '@/shared/types/backup';

export function exportBackup(db: FinanceDatabase): Promise<FinanceBackup> {
  return serializeDatabase(db, async () => {
    const accounts = await db.getAllAsync<
      Omit<BackupAccount, 'isDemo'> & { isDemo: number }
    >(
      `SELECT id, name, type, balance, opening_balance AS openingBalance, is_demo AS isDemo, provider_id AS providerId
       FROM accounts WHERE profile_id = ? AND deleted_at IS NULL ORDER BY id`,
      LOCAL_PROFILE_ID,
    );
    const transactions = await db.getAllAsync<
      Omit<BackupTransaction, 'isDemo' | 'isReviewed'> & {
        isDemo: number;
        isReviewed: number;
      }
    >(
      `SELECT id, account_id AS accountId, title, merchant, amount, type, category, occurred_at AS occurredAt,
       note, source, is_reviewed AS isReviewed, salary_month AS salaryMonth, is_demo AS isDemo, external_id AS externalId
       FROM transactions WHERE profile_id = ? AND deleted_at IS NULL ORDER BY id`,
      LOCAL_PROFILE_ID,
    );
    const settings = await db.getFirstAsync(
      'SELECT initial_balance AS initialBalance, monthly_income AS monthlyIncome, salary_day AS salaryDay FROM settings WHERE profile_id = ?',
      LOCAL_PROFILE_ID,
    );
    return parseBackup({
      format: 'monee-backup',
      version: 1,
      currency: 'VND',
      createdAt: new Date().toISOString(),
      settings,
      accounts: accounts.map((row) => ({
        ...row,
        providerId: row.providerId ?? undefined,
        isDemo: row.isDemo === 1,
      })),
      transactions: transactions.map((row) => ({
        ...row,
        isDemo: row.isDemo === 1,
        isReviewed: row.isReviewed === 1,
        note: row.note ?? undefined,
        salaryMonth: row.salaryMonth ?? undefined,
        externalId: row.externalId ?? undefined,
      })),
    });
  });
}

/** Called only after a separate, explicit in-app replace confirmation. Never runs at startup. */
export async function restoreBackup(db: FinanceDatabase, value: unknown) {
  const backup = parseBackup(value);
  return writeDatabase(db, async (tx) => {
    const owner = await tx.getFirstAsync<{
      auth_user_id: string | null;
      sync_enabled: number;
    }>(
      'SELECT auth_user_id, sync_enabled FROM profiles WHERE id = ?',
      LOCAL_PROFILE_ID,
    );
    if (!owner || owner.auth_user_id || owner.sync_enabled)
      throw new FinanceError('restoreUnavailable');
    const foreignAccounts = await tx.getAllAsync<{ id: string }>(
      'SELECT id FROM accounts WHERE profile_id != ?',
      LOCAL_PROFILE_ID,
    );
    const foreignTransactions = await tx.getAllAsync<{ id: string }>(
      'SELECT id FROM transactions WHERE profile_id != ?',
      LOCAL_PROFILE_ID,
    );
    const accountIds = new Set(backup.accounts.map((row) => row.id));
    const transactionIds = new Set(backup.transactions.map((row) => row.id));
    if (
      foreignAccounts.some((row) => accountIds.has(row.id)) ||
      foreignTransactions.some((row) => transactionIds.has(row.id))
    )
      throw new FinanceError('restoreUnavailable');
    const timestamp = new Date().toISOString();
    await tx.runAsync(
      'DELETE FROM transactions WHERE profile_id = ?',
      LOCAL_PROFILE_ID,
    );
    await tx.runAsync(
      'DELETE FROM accounts WHERE profile_id = ?',
      LOCAL_PROFILE_ID,
    );
    for (const account of backup.accounts) {
      const metadata = accountTypes.find((item) => item.type === account.type)!;
      await tx.runAsync(
        `INSERT INTO accounts (id, profile_id, name, type, balance, opening_balance, icon, color, provider_id, sync_status, sync_state, created_at, updated_at, is_demo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'local', 'pending', ?, ?, ?)`,
        account.id,
        LOCAL_PROFILE_ID,
        account.name,
        account.type,
        account.balance,
        account.openingBalance,
        metadata.icon,
        metadata.color,
        account.providerId ?? null,
        timestamp,
        timestamp,
        account.isDemo ? 1 : 0,
      );
    }
    for (const row of backup.transactions) {
      await tx.runAsync(
        `INSERT INTO transactions (id, profile_id, account_id, title, merchant, amount, type, category, occurred_at, note,
         source, is_reviewed, salary_month, is_demo, external_id, sync_state, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
        row.id,
        LOCAL_PROFILE_ID,
        row.accountId,
        row.title,
        row.merchant,
        row.amount,
        row.type,
        row.category,
        row.occurredAt,
        row.note ?? null,
        row.source,
        row.isReviewed ? 1 : 0,
        row.salaryMonth ?? null,
        row.isDemo ? 1 : 0,
        row.externalId ?? null,
        timestamp,
        timestamp,
      );
    }
    await tx.runAsync(
      'UPDATE settings SET initial_balance = ?, monthly_income = ?, salary_day = ?, updated_at = ? WHERE profile_id = ?',
      backup.settings.initialBalance,
      backup.settings.monthlyIncome,
      backup.settings.salaryDay,
      timestamp,
      LOCAL_PROFILE_ID,
    );
  });
}
