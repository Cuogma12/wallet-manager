import { router } from 'expo-router';

export function useTransactionNavigation() {
  function openTransaction(id: string) {
    router.push({ pathname: '/transaction-detail', params: { id } });
  }
  function addTransaction() {
    router.push('/add');
  }
  return { openTransaction, addTransaction };
}
