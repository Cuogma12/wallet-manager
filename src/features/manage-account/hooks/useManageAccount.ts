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

export function useManageAccount() {
  const { accountId } = useLocalSearchParams<{ accountId?: string }>();
  const { accounts, saveAccount } = useFinance();
  const existing = accounts.find((account) => account.id === accountId);
  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState<AccountType>(existing?.type ?? 'cash');
  const [balance, setBalance] = useState(
    existing ? String(existing.balance) : '',
  );
  const action = useAsyncAction();
  const { close } = useFormNavigation();
  const notFound = Boolean(accountId && !existing);
  function save() {
    void action.run(async () => {
      if (notFound) throw new FinanceError('accountNotFound');
      await saveAccount({
        id: accountId,
        name,
        type,
        balance: parseMoneyInput(balance),
      });
    }, close);
  }
  return {
    name,
    setName,
    type,
    setType,
    balance,
    setBalance,
    editing: Boolean(accountId),
    notFound,
    save,
    close,
    ...action,
  };
}
