import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { useFinance } from '@/context/FinanceContext';
import { useTransactionDate } from '@/features/add-transaction/hooks/useTransactionDate';
import { resolveTransactionDate } from '@/features/add-transaction/utils/transactionDate';
import {
  buildQuickTransactionTemplates,
  type QuickTransactionTemplate,
} from '@/features/add-transaction/utils/quickTransaction';
import { parseQuickTransactionText } from '@/features/add-transaction/utils/parseQuickTransactionText';
import { learnCategoryFromHistory } from '@/features/add-transaction/utils/learnedCategory';
import { parseBalanceNotification } from '@/services/imports/parseBalanceNotification';
import { getAccountProvider } from '@/shared/constants/accountProviders';
import {
  expenseCategories,
  getCategoryIcon,
} from '@/shared/constants/categories';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';
import { useFormNavigation } from '@/shared/hooks/useFormNavigation';
import { useI18n } from '@/shared/i18n';
import { normalizeCategoryName } from '@/shared/utils/category';
import {
  formatInputDate,
  parseMoneyInput,
} from '@/shared/utils/financeValidation';

type EntryMode = 'quick' | 'paste';
type TransactionType = 'expense' | 'income';

export function useAddTransaction() {
  const finance = useFinance();
  const { accounts, transactions, customCategories, addTransaction } = finance;
  const { t, intlLocale } = useI18n();
  const validExpenseCategories = useMemo(
    () => [
      ...expenseCategories.map((item) => item.key),
      ...customCategories.map((item) => item.id),
    ],
    [customCategories],
  );
  const templates = useMemo(
    () =>
      buildQuickTransactionTemplates(
        transactions,
        accounts,
        validExpenseCategories,
      ),
    [accounts, transactions, validExpenseCategories],
  );
  const latestExpense = templates.find((item) => item.type === 'expense');
  const [mode, setModeState] = useState<EntryMode>('quick');
  const [quickText, setQuickTextState] = useState('');
  const [quickTextSource, setQuickTextSource] = useState<
    'history' | 'rules' | null
  >(null);
  const [showDetails, setShowDetails] = useState(false);
  const [type, setTypeState] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAccountId, setAccountId] = useState('');
  const [note, setNote] = useState('');
  const [pasteText, setPasteTextState] = useState('');
  const [parsedText, setParsedText] = useState('');
  const [pasteErrorKey, setPasteErrorKey] = useState<
    'empty' | 'amount' | 'type' | null
  >(null);
  const [importMetadata, setImportMetadata] = useState<{
    externalId: string;
    merchant: string;
    occurredAt: string;
    inputDate: string;
  } | null>(null);
  const action = useAsyncAction();
  const transactionDate = useTransactionDate(action.isSaving);
  const navigation = useFormNavigation();
  const fallbackCategory = validExpenseCategories.includes(
    latestExpense?.category ?? '',
  )
    ? latestExpense!.category
    : expenseCategories[0].key;
  const category = validExpenseCategories.includes(selectedCategory)
    ? selectedCategory
    : fallbackCategory;
  const latestAccountId = templates[0]?.accountId;
  const accountId = accounts.some((account) => account.id === selectedAccountId)
    ? selectedAccountId
    : accounts.some((account) => account.id === latestAccountId)
      ? latestAccountId!
      : (accounts[0]?.id ?? '');
  const parsedAmount = parseMoneyInput(amount);
  const amountPreview =
    parsedAmount > 0 && Number.isSafeInteger(parsedAmount)
      ? parsedAmount.toLocaleString(intlLocale)
      : '';
  const selectedAccount = accounts.find((account) => account.id === accountId);
  const builtInCategory = expenseCategories.find(
    (item) => item.key === category,
  );
  const categoryLabel =
    customCategories.find((item) => item.id === category)?.name ??
    t(builtInCategory?.labelKey ?? 'categories.other');
  const defaultTitle =
    type === 'income' ? t('add.defaultIncomeTitle') : categoryLabel;
  const displayTitle = title.trim() || defaultTitle;
  const summaryCategory = type === 'income' ? t('add.income') : categoryLabel;
  const pasteReady =
    !!importMetadata && parsedText !== '' && parsedText === pasteText.trim();
  const canSave =
    !!accounts.length &&
    !!accountId &&
    Number.isSafeInteger(parsedAmount) &&
    parsedAmount > 0 &&
    (mode === 'quick' || pasteReady);

  function resetImport() {
    setImportMetadata(null);
    setParsedText('');
    setPasteErrorKey(null);
  }
  function setMode(nextMode: EntryMode) {
    if (action.isSaving || nextMode === mode) return;
    setModeState(nextMode);
    if (nextMode === 'paste') {
      setQuickTextState('');
      setQuickTextSource(null);
    }
    resetImport();
  }
  function changeQuickText(value: string) {
    if (action.isSaving) return;
    setQuickTextState(value);
    const parsed = parseQuickTransactionText(value);
    if (!parsed) {
      if (quickTextSource) {
        setAmount('');
        setTitle('');
        setSelectedCategory('');
      }
      setQuickTextSource(null);
      return;
    }
    const customCategory = customCategories.find((item) => {
      const normalized = normalizeCategoryName(item.name);
      return (
        normalized.length >= 3 && parsed.normalizedText.includes(normalized)
      );
    });
    const learnedCategory = learnCategoryFromHistory(
      parsed.title,
      transactions,
      validExpenseCategories,
    );
    setTypeState(parsed.type);
    setAmount(String(parsed.amount));
    setTitle(parsed.title);
    setSelectedCategory(
      customCategory?.id ?? learnedCategory?.category ?? parsed.category,
    );
    if (parsed.date === 'today') transactionDate.chooseToday();
    if (parsed.date === 'yesterday') transactionDate.chooseYesterday();
    setQuickTextSource(learnedCategory ? 'history' : 'rules');
  }
  function changeType(nextType: TransactionType) {
    if (!action.isSaving) setTypeState(nextType);
  }
  function changeAmount(value: string) {
    if (!action.isSaving) setAmount(value);
  }
  function blurAmount() {
    setAmount((current) => {
      const parsed = parseMoneyInput(current);
      return Number.isSafeInteger(parsed) ? String(parsed) : current;
    });
  }
  function changeTitle(value: string) {
    if (!action.isSaving) setTitle(value);
  }
  function changeCategory(key: string) {
    if (!action.isSaving && validExpenseCategories.includes(key))
      setSelectedCategory(key);
  }
  function changeAccount(id: string) {
    if (!action.isSaving) setAccountId(id);
  }
  function changeNote(value: string) {
    if (!action.isSaving) setNote(value);
  }
  function toggleDetails() {
    if (!action.isSaving) setShowDetails((current) => !current);
  }
  function setPasteText(value: string) {
    if (action.isSaving) return;
    setPasteTextState(value);
    setPasteErrorKey(null);
  }
  function applyTemplate(templateId: string) {
    const template = templates.find((item) => item.id === templateId);
    if (!template || action.isSaving) return;
    setTypeState(template.type);
    setAmount(String(template.amount));
    setTitle(template.title);
    if (template.type === 'expense') setSelectedCategory(template.category);
    setAccountId(template.accountId);
    transactionDate.chooseToday();
    setModeState('quick');
    setQuickTextState('');
    setQuickTextSource(null);
    resetImport();
  }
  function findAccount(normalizedText: string) {
    return accounts.find((account) => {
      const provider = getAccountProvider(account.providerId);
      const candidates = [
        account.name,
        provider?.name,
        provider?.fullName,
        ...(provider?.aliases.split(/\s+/) ?? []),
      ];
      return candidates.some((candidate) => {
        const normalized = normalizeCategoryName(candidate ?? '');
        return normalized.length >= 3 && normalizedText.includes(normalized);
      });
    });
  }
  function analyzePaste() {
    if (action.isSaving) return;
    const parsed = parseBalanceNotification(pasteText);
    if (!parsed.ok) {
      setPasteErrorKey(parsed.reason);
      setImportMetadata(null);
      setParsedText('');
      return;
    }
    const value = parsed.value;
    const customCategory = customCategories.find((item) => {
      const normalized = normalizeCategoryName(item.name);
      return (
        normalized.length >= 3 && value.normalizedText.includes(normalized)
      );
    });
    const matchingAccount = findAccount(value.normalizedText);
    setTypeState(value.type);
    setAmount(String(value.amount));
    setTitle(value.title);
    setSelectedCategory(customCategory?.id ?? value.category);
    if (matchingAccount) setAccountId(matchingAccount.id);
    setNote('');
    transactionDate.changeDate(formatInputDate(new Date(value.occurredAt)));
    setImportMetadata({
      externalId: value.externalId,
      merchant: value.merchant,
      occurredAt: value.occurredAt,
      inputDate: formatInputDate(new Date(value.occurredAt)),
    });
    setParsedText(pasteText.trim());
    setPasteErrorKey(null);
    setShowDetails(true);
  }
  function openSalary() {
    router.push('/salary');
  }
  function save() {
    if (!canSave) return;
    const finalCategory = type === 'income' ? 'other' : category;
    const finalTitle = displayTitle;
    void action.run(
      () =>
        addTransaction({
          accountId,
          title: finalTitle,
          merchant: importMetadata?.merchant ?? finalTitle,
          amount: parseMoneyInput(amount),
          type,
          category: finalCategory,
          categoryIcon: getCategoryIcon(finalCategory),
          occurredAt:
            importMetadata?.inputDate === transactionDate.date
              ? importMetadata.occurredAt
              : resolveTransactionDate(transactionDate.date),
          note: note.trim(),
          source: importMetadata ? 'imported' : 'manual',
          externalId: importMetadata?.externalId,
          isReviewed: true,
        }),
      navigation.close,
    );
  }
  function templateAccountName(template: QuickTransactionTemplate) {
    return (
      accounts.find((account) => account.id === template.accountId)?.name ?? ''
    );
  }

  return {
    accounts,
    customCategories,
    templates,
    templateAccountName,
    transactionDate,
    mode,
    setMode,
    quickText,
    quickTextSource,
    changeQuickText,
    showDetails,
    toggleDetails,
    type,
    changeType,
    amountDisplay: amount,
    amountPreview,
    changeAmount,
    blurAmount,
    title,
    changeTitle,
    category,
    categoryLabel,
    displayTitle,
    summaryCategory,
    changeCategory,
    accountId,
    selectedAccountName: selectedAccount?.name ?? '',
    changeAccount,
    note,
    changeNote,
    pasteText,
    canAnalyzePaste: !!pasteText.trim(),
    setPasteText,
    analyzePaste,
    pasteReady,
    pasteError: pasteErrorKey ? t(`add.paste.errors.${pasteErrorKey}`) : '',
    applyTemplate,
    canSave,
    save,
    openSalary,
    ...navigation,
    ...action,
  };
}
