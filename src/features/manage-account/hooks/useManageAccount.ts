import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useFinance } from '@/context/FinanceContext';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';
import { useFormNavigation } from '@/shared/hooks/useFormNavigation';
import {
  parseMoneyInput,
  FinanceError,
} from '@/shared/utils/financeValidation';
import type { AccountType } from '@/shared/types/finance';
import { getAccountProvider } from '@/shared/constants/accountProviders';
import { useAccountProviderSearch } from '@/shared/hooks/useAccountProviderSearch';
import { suggestAccountName } from '@/shared/utils/accountProviders';

export function useManageAccount() {
  const { accountId, providerId: routeProviderId } = useLocalSearchParams<{
    accountId?: string;
    providerId?: string;
  }>();
  const { accounts, saveAccount } = useFinance();
  const existing = accounts.find((account) => account.id === accountId);
  const preset = !accountId ? getAccountProvider(routeProviderId) : undefined;
  const [name, setName] = useState(existing?.name ?? preset?.name ?? '');
  const [type, setAccountType] = useState<AccountType>(
    existing?.type ?? preset?.type ?? 'cash',
  );
  const [providerId, setProviderId] = useState<string | null>(
    existing?.providerId ?? preset?.id ?? null,
  );
  const [providerPickerExpanded, setProviderPickerExpanded] = useState(false);
  const search = useAccountProviderSearch(type);
  const selectedProvider = getAccountProvider(providerId);
  const [balance, setBalance] = useState(
    existing ? String(existing.balance) : '',
  );
  const action = useAsyncAction();
  const { close } = useFormNavigation();
  const notFound = Boolean(accountId && !existing);
  function setType(nextType: AccountType) {
    if (action.isSaving || nextType === type) return;
    setName(suggestAccountName(name, providerId, null));
    setAccountType(nextType);
    setProviderId(null);
    search.setQuery('');
    setProviderPickerExpanded(nextType !== 'cash');
  }
  function selectProvider(nextId: string | null) {
    if (action.isSaving) return;
    const provider = getAccountProvider(nextId);
    if (nextId !== null && provider?.type !== type) return;
    setName(suggestAccountName(name, providerId, nextId));
    setProviderId(nextId);
    search.setQuery('');
    setProviderPickerExpanded(false);
  }
  function toggleProviderPicker() {
    if (!action.isSaving) setProviderPickerExpanded((expanded) => !expanded);
  }
  function save() {
    void action.run(async () => {
      if (notFound) throw new FinanceError('accountNotFound');
      await saveAccount({
        id: accountId,
        name,
        type,
        providerId,
        balance: parseMoneyInput(balance),
      });
    }, close);
  }
  return {
    name,
    setName,
    type,
    setType,
    providerId,
    selectedProvider,
    providerPickerExpanded,
    toggleProviderPicker,
    selectProvider,
    providerSearch: search,
    balance,
    setBalance,
    editing: Boolean(accountId),
    notFound,
    save,
    close,
    ...action,
  };
}
