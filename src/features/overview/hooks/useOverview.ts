import { router } from 'expo-router';
import { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useI18n } from '@/shared/i18n';
import { useMonthSelection } from '@/shared/hooks/useMonthSelection';
import { useTransactionNavigation } from '@/shared/hooks/useTransactionNavigation';
import { summarizeMonth } from '@/shared/utils/financeSummary';

export function useOverview() {
  const { accounts, transactions, loadError, refresh } = useFinance();
  const { intlLocale } = useI18n();
  const selection = useMonthSelection();
  const navigation = useTransactionNavigation();
  const summary = useMemo(
    () => summarizeMonth(transactions, selection.month, selection.today),
    [transactions, selection.month, selection.today],
  );
  const accountById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts],
  );
  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );
  const dateLabel = selection.today.toLocaleDateString(intlLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  function seeAll() {
    router.navigate({
      pathname: '/transactions',
      params: { month: selection.month },
    });
  }
  return {
    ...selection,
    ...navigation,
    summary,
    totalBalance,
    dateLabel,
    accountById,
    loadError,
    refresh,
    seeAll,
  };
}
