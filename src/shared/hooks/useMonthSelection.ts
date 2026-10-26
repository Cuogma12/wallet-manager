import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { useI18n } from '@/shared/i18n';
import {
  assertMonth,
  formatMonth,
  getMonthKey,
  shiftMonth,
} from '@/shared/utils/financeValidation';

export function useMonthSelection() {
  const { month: parameter } = useLocalSearchParams<{
    month?: string | string[];
  }>();
  const { intlLocale } = useI18n();
  const [today, setToday] = useState(() => new Date());
  useFocusEffect(
    useCallback(() => {
      const refreshDate = () => setToday(new Date());
      refreshDate();
      const timer = setInterval(refreshDate, 60_000);
      return () => clearInterval(timer);
    }, []),
  );
  let month = getMonthKey(today);
  try {
    if (typeof parameter === 'string') {
      assertMonth(parameter);
      month = parameter;
    }
  } catch {
    // Malformed deep-link parameters must not crash the screen.
  }
  function previousMonth() {
    if (month > '1900-01') router.setParams({ month: shiftMonth(month, -1) });
  }
  function nextMonth() {
    if (month < '9999-12') router.setParams({ month: shiftMonth(month, 1) });
  }
  function currentMonth() {
    router.setParams({ month: getMonthKey(today) });
  }
  return {
    month,
    today,
    monthLabel: formatMonth(month, intlLocale),
    previousMonth,
    nextMonth,
    currentMonth,
  };
}
