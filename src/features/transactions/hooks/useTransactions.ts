import { useMemo, useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useMonthSelection } from '@/shared/hooks/useMonthSelection';
import { useTransactionNavigation } from '@/shared/hooks/useTransactionNavigation';
import { summarizeMonth } from '@/shared/utils/financeSummary';
import { expenseCategories } from '@/shared/constants/categories';
import { useI18n } from '@/shared/i18n';

export function useTransactions() {
  const { accounts, transactions, loadError, refresh } = useFinance();
  const { t } = useI18n();
  const selection = useMonthSelection();
  const navigation = useTransactionNavigation();
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [search, setSearch] = useState('');
  const accountById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts],
  );
  const filteredTransactions = useMemo(() => {
    const selected = summarizeMonth(
      transactions,
      selection.month,
      selection.today,
    ).transactions;
    const query = search.trim().toLocaleLowerCase();
    return selected.filter((tx) => {
      const category =
        tx.category === 'salary'
          ? t('categories.salary')
          : t(
              expenseCategories.find((item) => item.key === tx.category)
                ?.labelKey ?? 'categories.other',
            );
      const text =
        `${tx.title} ${tx.merchant} ${tx.note ?? ''} ${category} ${accountById.get(tx.accountId)?.name ?? ''}`.toLocaleLowerCase();
      return (filter === 'all' || tx.type === filter) && text.includes(query);
    });
  }, [
    transactions,
    selection.month,
    selection.today,
    search,
    filter,
    accountById,
    t,
  ]);
  return {
    ...selection,
    ...navigation,
    filter,
    setFilter,
    search,
    setSearch,
    filteredTransactions,
    accountById,
    loadError,
    refresh,
  };
}
