import { useMemo } from 'react';
import { useI18n } from '@/shared/i18n';
import { formatCompactCurrency, formatCurrency } from '@/shared/utils/format';
import type { DailyExpense } from '@/shared/utils/financeSummary';

export function useSpendingChart(days: DailyExpense[]) {
  const { t, intlLocale } = useI18n();
  return useMemo(() => {
    const maximum = Math.max(0, ...days.map((day) => day.amount));
    const bars = days.map((day) => ({
      key: day.day,
      accessibilityLabel: t('overview.chartDay', {
        date: day.date.toLocaleDateString(intlLocale),
        amount: formatCurrency(day.amount),
      }),
      amountLabel: formatCompactCurrency(day.amount),
      dateLabel: day.date.toLocaleDateString(intlLocale, {
        day: 'numeric',
        month: 'numeric',
      }),
      height: maximum ? (day.amount / maximum) * 96 : 0,
    }));
    return { bars, isEmpty: maximum === 0 };
  }, [days, intlLocale, t]);
}
