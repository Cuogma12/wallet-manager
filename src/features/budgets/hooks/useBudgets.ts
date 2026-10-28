import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { expenseCategories } from '@/shared/constants/categories';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';
import { useMonthSelection } from '@/shared/hooks/useMonthSelection';
import { useI18n } from '@/shared/i18n';
import type { Budget } from '@/shared/types/budget';
import { summarizeBudgets } from '@/shared/utils/budgetSummary';
import { formatMonth, parseMoneyInput } from '@/shared/utils/financeValidation';

type Editor = { id?: string; month: string; category: string; amount: string };

export function useBudgets() {
  const finance = useFinance();
  const selection = useMonthSelection();
  const action = useAsyncAction();
  const { intlLocale } = useI18n();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Budget | null>(null);
  const month = editor?.month ?? pendingDelete?.month ?? selection.month;
  const summary = useMemo(
    () => summarizeBudgets(finance.budgets, finance.transactions, month),
    [finance.budgets, finance.transactions, month],
  );
  const unusedCategory = expenseCategories.find(
    (category) =>
      !summary.items.some((item) => item.budget.category === category.key),
  );
  const busy = action.isSaving || !!editor || !!pendingDelete;

  function openCreate() {
    if (busy || !unusedCategory) return;
    action.clearError();
    setEditor({
      month: selection.month,
      category: unusedCategory.key,
      amount: '',
    });
  }
  function openEdit(budget: Budget) {
    if (!busy) action.clearError();
    if (!busy)
      setEditor({
        id: budget.id,
        month: budget.month,
        category: budget.category,
        amount: String(budget.limit),
      });
  }
  function changeAmount(amount: string) {
    if (!action.isSaving) setEditor((value) => value && { ...value, amount });
  }
  function changeCategory(category: string) {
    if (!action.isSaving) setEditor((value) => value && { ...value, category });
  }
  function cancelEditor() {
    if (!action.isSaving) {
      action.clearError();
      setEditor(null);
    }
  }
  function saveEditor() {
    if (!editor) return;
    void action.run(
      () =>
        finance.saveBudget({
          id: editor.id,
          month: editor.month,
          category: editor.category,
          limit: parseMoneyInput(editor.amount),
        }),
      () => setEditor(null),
    );
  }
  function askDelete(budget: Budget) {
    if (!busy) {
      action.clearError();
      setPendingDelete(budget);
    }
  }
  function cancelDelete() {
    if (!action.isSaving) {
      action.clearError();
      setPendingDelete(null);
    }
  }
  function confirmDelete() {
    if (!pendingDelete) return;
    void action.run(
      () => finance.deleteBudget(pendingDelete.id),
      () => setPendingDelete(null),
    );
  }
  function back() {
    if (!busy) router.replace('/');
  }

  return {
    ...selection,
    month,
    monthLabel: formatMonth(month, intlLocale),
    summary,
    editor,
    pendingDelete,
    busy,
    canAdd: !!unusedCategory,
    isSaving: action.isSaving,
    error: action.error,
    loadError: finance.loadError,
    refresh: finance.refresh,
    openCreate,
    openEdit,
    changeAmount,
    changeCategory,
    cancelEditor,
    saveEditor,
    askDelete,
    cancelDelete,
    confirmDelete,
    back,
  };
}
