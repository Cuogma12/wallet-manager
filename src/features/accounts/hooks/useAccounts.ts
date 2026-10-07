import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useFinance } from '@/context/FinanceContext';
import { useI18n } from '@/shared/i18n';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';

export function useAccounts() {
  const {
    accounts,
    transactions,
    clearDemoData,
    resetFinancialData,
    loadError,
    refresh,
  } = useFinance();
  const { t } = useI18n();
  const action = useAsyncAction();
  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );
  const hasDemo =
    accounts.some((account) => account.isDemo) ||
    transactions.some((transaction) => transaction.isDemo);
  function createAccount() {
    router.push('/manage-account');
  }
  function editAccount(accountId: string) {
    if (!action.isSaving)
      router.push({ pathname: '/manage-account', params: { accountId } });
  }
  function openSalary() {
    router.push('/salary');
  }
  function openConnections() {
    router.push('/connect-accounts');
  }
  function openImport() {
    Alert.alert(t('accounts.importStatement'), t('accounts.importComingSoon'));
  }
  function confirmClearDemo() {
    if (action.isSaving) return;
    Alert.alert(t('accounts.clearDemoTitle'), t('accounts.clearDemoConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('accounts.clearDemo'),
        style: 'destructive',
        onPress: () => {
          void action.run(clearDemoData, () =>
            Alert.alert(
              t('accounts.clearDemoDone'),
              t('accounts.clearDemoDoneText'),
            ),
          );
        },
      },
    ]);
  }
  function confirmResetFinance() {
    if (action.isSaving) return;
    Alert.alert(t('accounts.resetTitle'), t('accounts.resetConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('accounts.resetAll'),
        style: 'destructive',
        onPress: () => {
          void action.run(resetFinancialData, () =>
            Alert.alert(t('accounts.resetDone'), t('accounts.resetDoneText')),
          );
        },
      },
    ]);
  }
  return {
    accounts,
    totalBalance,
    hasDemo,
    createAccount,
    editAccount,
    openSalary,
    openConnections,
    openImport,
    confirmClearDemo,
    confirmResetFinance,
    loadError,
    refresh,
    ...action,
  };
}
