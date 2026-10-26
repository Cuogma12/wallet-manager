import { Text, View } from 'react-native';
import { useI18n } from '@/shared/i18n';
import { useSpendingChart } from '@/features/overview/hooks/useSpendingChart';
import type { DailyExpense } from '@/shared/utils/financeSummary';
import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';

export function SpendingChart({ days }: { days: DailyExpense[] }) {
  const { t } = useI18n();
  const chart = useSpendingChart(days);
  return (
    <View className={cn(uiClasses.card, 'p-lg gap-md')}>
      <Text className={uiClasses.hint}>{t('overview.chartHint')}</Text>
      <View className="flex-row items-end justify-around gap-xs">
        {chart.bars.map((bar) => (
          <View
            key={bar.key}
            accessible
            accessibilityLabel={bar.accessibilityLabel}
            className="flex-1 items-center gap-sm"
          >
            <Text numberOfLines={1} className="text-xs text-textMuted">
              {bar.amountLabel}
            </Text>
            <View className="h-24 justify-end">
              <View
                className="w-5 rounded-sm bg-primary"
                style={{ height: bar.height }}
              />
            </View>
            <Text className="text-xs text-textMuted">{bar.dateLabel}</Text>
          </View>
        ))}
      </View>
      {chart.isEmpty && (
        <Text className={uiClasses.hint}>{t('overview.noSpending')}</Text>
      )}
    </View>
  );
}
