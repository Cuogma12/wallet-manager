import { useState } from 'react';
import { router } from 'expo-router';
import { useFinance } from '@/context/FinanceContext';
import { expenseCategories } from '@/shared/constants/categories';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';
import { useFormNavigation } from '@/shared/hooks/useFormNavigation';
import { useI18n } from '@/shared/i18n';
import { parseMoneyInput } from '@/shared/utils/financeValidation';
import { useTransactionDate } from '@/features/add-transaction/hooks/useTransactionDate';
import { resolveTransactionDate } from '@/features/add-transaction/utils/transactionDate';

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
  const transactionDate = useTransactionDate(action.isSaving);
  const navigation = useFormNavigation();
  const accountId = accounts.some((account) => account.id === selectedAccountId)
    ? selectedAccountId
    : (accounts[0]?.id ?? '');
  const parsedAmount = parseMoneyInput(amount);
  // Keep grouping out of the editable value, even across focus changes: changing
  // its value on focus can reset a selection and turn a replacement into append.
  const amountPreview =
    parsedAmount > 0 && Number.isSafeInteger(parsedAmount)
      ? parsedAmount.toLocaleString(intlLocale)
      : '';
  function changeAmount(value: string) {
    setAmount(value);
  }
  function blurAmount() {
    setAmount((current) => {
      const parsed = parseMoneyInput(current);
      // Normalize valid grouped pastes before the next edit. Invalid/unsafe
      // input stays untouched and is still rejected by the repository.
      return Number.isSafeInteger(parsed) ? String(parsed) : current;
    });
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
          occurredAt: resolveTransactionDate(transactionDate.date),
          note: note.trim(),
        }),
      navigation.close,
    );
  }
  return {
    accounts,
    transactionDate,
    type,
    setType,
    amountDisplay: amount,
    amountPreview,
    changeAmount,
    blurAmount,
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
