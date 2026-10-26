import { useState } from 'react';
import { router } from 'expo-router';
import { useFormNavigation } from '@/shared/hooks/useFormNavigation';
import { useAccountProviderSearch } from '@/shared/hooks/useAccountProviderSearch';
import { getAccountProvider } from '@/shared/constants/accountProviders';
import type { AccountType } from '@/shared/types/finance';

export function useAccountConnections() {
  const [type, setType] = useState<AccountType>('bank');
  const search = useAccountProviderSearch(type);
  const { close } = useFormNavigation();
  function changeType(next: AccountType) {
    if (next === 'cash') return;
    setType(next);
    search.setQuery('');
  }
  function createAccount(providerId: string) {
    if (getAccountProvider(providerId))
      router.push({ pathname: '/manage-account', params: { providerId } });
  }
  function manualEntry() {
    router.push('/manage-account');
  }
  return {
    type,
    changeType,
    ...search,
    goBack: close,
    createAccount,
    manualEntry,
  };
}
