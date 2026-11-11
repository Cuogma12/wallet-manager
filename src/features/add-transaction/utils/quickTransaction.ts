import type { Account, Transaction } from '@/shared/types/finance';

export type QuickTransactionTemplate = Pick<
  Transaction,
  'id' | 'accountId' | 'title' | 'amount' | 'category'
> & { type: 'expense' | 'income'; usageCount: number };

type RankedTemplate = QuickTransactionTemplate & { recency: number };

/** Returns frequently reused transactions, keeping the latest amount for each one. */
export function buildQuickTransactionTemplates(
  transactions: Transaction[],
  accounts: Account[],
  expenseCategoryKeys: string[],
  maximum = 4,
): QuickTransactionTemplate[] {
  const accountIds = new Set(accounts.map((account) => account.id));
  const categoryKeys = new Set(expenseCategoryKeys);
  const templates = new Map<string, RankedTemplate>();

  transactions.forEach((transaction, recency) => {
    if (
      transaction.isDemo ||
      transaction.type === 'transfer' ||
      transaction.category === 'salary' ||
      !accountIds.has(transaction.accountId) ||
      (transaction.type === 'expense' &&
        !categoryKeys.has(transaction.category))
    )
      return;
    const signature = [
      transaction.type,
      transaction.accountId,
      transaction.category,
      transaction.title.trim().toLocaleLowerCase('vi-VN'),
    ].join('|');
    const existing = templates.get(signature);
    if (existing) {
      existing.usageCount += 1;
      return;
    }
    templates.set(signature, {
      id: transaction.id,
      accountId: transaction.accountId,
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      usageCount: 1,
      recency,
    });
  });
  return [...templates.values()]
    .sort(
      (left, right) =>
        right.usageCount - left.usageCount || left.recency - right.recency,
    )
    .slice(0, maximum)
    .map(({ recency: _recency, ...template }) => template);
}
