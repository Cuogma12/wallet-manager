import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useFinance } from '@/context/FinanceContext';
import { useI18n } from '@/shared/i18n';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';
import { useFormNavigation } from '@/shared/hooks/useFormNavigation';
import { expenseCategories } from '@/shared/constants/categories';
import {
  buildTransactionUpdate,
  initialTransactionFields,
  type TransactionFields,
} from '@/features/transaction-detail/utils/transactionForm';

export function useTransactionDetail() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const {
    accounts,
    transactions,
    updateTransaction,
    deleteTransaction,
    loadError,
    refresh,
  } = useFinance();
  const { t, intlLocale } = useI18n();
  const transaction = transactions.find((item) => item.id === id);
  const [fields, setFields] = useState(() =>
    initialTransactionFields(transaction),
  );
  const [isEditing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const action = useAsyncAction();
  const navigation = useFormNavigation();
  const editable =
    transaction?.source === 'manual' && transaction.type !== 'transfer';
  const account = accounts.find((item) => item.id === transaction?.accountId);
  const categoryLabel =
    transaction?.category === 'salary'
      ? t('categories.salary')
      : t(
          expenseCategories.find((item) => item.key === transaction?.category)
            ?.labelKey ?? 'categories.other',
        );
  const dateLabel = transaction
    ? new Date(transaction.occurredAt).toLocaleDateString(intlLocale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';
  function change<K extends keyof TransactionFields>(
    key: K,
    value: TransactionFields[K],
  ) {
    setFields((current) => ({ ...current, [key]: value }));
  }
  function changeType(type: TransactionFields['type']) {
    setFields((current) => ({ ...current, type, category: 'other' }));
  }
  function edit() {
    if (!transaction || !editable || action.isSaving) return;
    setFields(initialTransactionFields(transaction));
    setEditing(true);
    setConfirmingDelete(false);
  }
  function cancelEdit() {
    setEditing(false);
  }
  function askDelete() {
    if (!action.isSaving) setConfirmingDelete(true);
  }
  function cancelDelete() {
    setConfirmingDelete(false);
  }
  function save() {
    if (!transaction || !editable) return;
    void action.run(
      () => updateTransaction(buildTransactionUpdate(transaction, fields)),
      navigation.close,
    );
  }
  function remove() {
    if (!transaction || !editable || !confirmingDelete) return;
    void action.run(() => deleteTransaction(transaction.id), navigation.close);
  }
  return {
    transaction,
    accounts,
    account,
    fields,
    change,
    changeType,
    categoryLabel,
    dateLabel,
    editable,
    isEditing,
    edit,
    cancelEdit,
    confirmingDelete,
    askDelete,
    cancelDelete,
    save,
    remove,
    loadError,
    refresh,
    ...action,
    ...navigation,
  };
}
