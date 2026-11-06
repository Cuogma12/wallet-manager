import type { Account, Transaction } from '@/shared/types/finance';

export type QuickTransactionTemplate = Pick<
  Transaction,
  'id' | 'accountId' | 'title' | 'amount' | 'category'
> & { type: 'expense' | 'income' };

/** Returns a short, de-duplicated list of transactions that can safely be reused. */
export function buildQuickTransactionTemplates(
  transactions: Transaction[],
  accounts: Account[],
  expenseCategoryKeys: string[],
  maximum = 4,
): QuickTransactionTemplate[] {
  const accountIds = new Set(accounts.map((account) => account.id));
  const categoryKeys = new Set(expenseCategoryKeys);
  const signatures = new Set<string>();
  const templates: QuickTransactionTemplate[] = [];

  for (const transaction of transactions) {
    if (
      transaction.isDemo ||
      transaction.type === 'transfer' ||
      transaction.category === 'salary' ||
      !accountIds.has(transaction.accountId) ||
      (transaction.type === 'expense' &&
        !categoryKeys.has(transaction.category))
    )
      continue;
    const signature = [
      transaction.type,
      transaction.accountId,
      transaction.category,
      transaction.amount,
      transaction.title.trim().toLocaleLowerCase('vi-VN'),
    ].join('|');
    if (signatures.has(signature)) continue;
    signatures.add(signature);
    templates.push({
      id: transaction.id,
      accountId: transaction.accountId,
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
    });
    if (templates.length === maximum) break;
  }
  return templates;
}
