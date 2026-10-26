import { useState } from 'react';
import { router } from 'expo-router';
import { useFinance } from '@/context/FinanceContext';
import { expenseCategories } from '@/shared/constants/categories';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';
import { useFormNavigation } from '@/shared/hooks/useFormNavigation';
import { useI18n } from '@/shared/i18n';
import { parseMoneyInput } from '@/shared/utils/financeValidation';

export function useAddTransaction() {
  const { accounts, addTransaction } = useFinance();
  const { intlLocale } = useI18n();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<(typeof expenseCategories)[number]>(
    expenseCategories[0],
  );
  const [selectedAccountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [note, setNote] = useState('');
  const action = useAsyncAction();
  const navigation = useFormNavigation();
  const accountId = accounts.some((account) => account.id === selectedAccountId)
    ? selectedAccountId
    : (accounts[0]?.id ?? '');
  const parsedAmount = parseMoneyInput(amount);
  const amountDisplay = Number.isSafeInteger(parsedAmount)
    ? parsedAmount.toLocaleString(intlLocale)
    : amount;
  function changeAmount(value: string) {
    setAmount(value);
  }
  function changeCategory(key: string) {
    const next = expenseCategories.find((item) => item.key === key);
    if (next) setCategory(next);
  }
  function openSalary() {
    router.push('/salary');
  }
  function save() {
    void action.run(
      () =>
        addTransaction({
          accountId,
          title: title.trim(),
          amount: parseMoneyInput(amount),
          type,
          category: type === 'income' ? 'other' : category.key,
          categoryIcon: type === 'income' ? 'cash-plus' : category.icon,
          occurredAt: new Date().toISOString(),
          note: note.trim(),
        }),
      navigation.close,
    );
  }
  return {
    accounts,
    type,
    setType,
    amountDisplay,
    changeAmount,
    title,
    setTitle,
    category,
    changeCategory,
    accountId,
    setAccountId,
    note,
    setNote,
    save,
    openSalary,
    ...navigation,
    ...action,
  };
}
