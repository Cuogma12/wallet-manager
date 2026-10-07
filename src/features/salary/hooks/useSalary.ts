import { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useI18n } from '@/shared/i18n';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';
import { useFormNavigation } from '@/shared/hooks/useFormNavigation';
import {
  formatInputDate,
  formatMonth,
  getMonthKey,
  parseInputDate,
  parseMoneyInput,
  shiftMonth,
} from '@/shared/utils/financeValidation';

export function useSalary() {
  const { accounts, transactions, recordSalary } = useFinance();
  const { t, intlLocale } = useI18n();
  const [month, setMonth] = useState(getMonthKey());
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(formatInputDate());
  const [selectedAccountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [includedInBalance, setIncludedInBalance] = useState(false);
  const action = useAsyncAction();
  const navigation = useFormNavigation();
  const accountId = accounts.some((a) => a.id === selectedAccountId)
    ? selectedAccountId
    : (accounts[0]?.id ?? '');
  const monthLabel = formatMonth(month, intlLocale);
  const alreadyRecorded = transactions.some(
    (tx) =>
      !tx.isDemo &&
      tx.type === 'income' &&
      (tx.salaryMonth === month ||
        (!tx.salaryMonth &&
          tx.category === 'salary' &&
          getMonthKey(new Date(tx.occurredAt)) === month)),
  );
  function previousMonth() {
    if (month > '1900-01') setMonth(shiftMonth(month, -1));
  }
  function nextMonth() {
    if (month < '9999-12') setMonth(shiftMonth(month, 1));
  }
  function save() {
    void action.run(
      () =>
        recordSalary({
          accountId,
          amount: parseMoneyInput(amount),
          month,
          receivedAt: parseInputDate(date),
          title: t('salary.transactionTitle', { month: monthLabel }),
          includedInBalance,
        }),
      navigation.close,
    );
  }
  return {
    accounts,
    accountId,
    setAccountId,
    month,
    monthLabel,
    previousMonth,
    nextMonth,
    amount,
    setAmount,
    date,
    setDate,
    includedInBalance,
    setIncludedInBalance,
    alreadyRecorded,
    save,
    ...navigation,
    ...action,
  };
}
