import { useState } from 'react';
import { useI18n } from '@/shared/i18n';
import {
  formatInputDate,
  formatMonth,
  shiftMonth,
} from '@/shared/utils/financeValidation';
import {
  getCalendarMonth,
  getCalendarWeeks,
} from '@/features/add-transaction/utils/transactionDate';

export function useTransactionDate(disabled: boolean) {
  const { intlLocale } = useI18n();
  const [date, setDate] = useState(() => formatInputDate());
  const [expanded, setExpanded] = useState(false);
  const [month, setMonth] = useState(() => getCalendarMonth(date));
  const weeks = getCalendarWeeks(month);
  const today = formatInputDate();
  function changeDate(value: string) {
    if (!disabled) setDate(value);
  }
  function toggleCalendar() {
    if (disabled) return;
    if (!expanded) setMonth(getCalendarMonth(date));
    setExpanded((current) => !current);
  }
  function selectDate(value: string) {
    if (disabled) return;
    setDate(value);
    setExpanded(false);
  }
  function chooseToday() {
    selectDate(formatInputDate());
  }
  function chooseYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    selectDate(formatInputDate(yesterday));
  }
  function previousMonth() {
    if (!disabled && month > '1900-01') setMonth(shiftMonth(month, -1));
  }
  function nextMonth() {
    if (!disabled && month < '9999-12') setMonth(shiftMonth(month, 1));
  }
  return {
    date,
    changeDate,
    expanded,
    toggleCalendar,
    selectDate,
    chooseToday,
    chooseYesterday,
    month,
    monthLabel: formatMonth(month, intlLocale),
    previousMonth,
    nextMonth,
    weeks,
    today,
    disabled,
  };
}
