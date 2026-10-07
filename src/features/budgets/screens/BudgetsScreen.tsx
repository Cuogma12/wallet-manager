import { cn } from '@/shared/styles/cn';
import { uiClasses } from '@/shared/styles/classes';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ScreenContainer } from '@/shared/components/atoms/ScreenContainer';
import {
  AppIcon,
  type AppIconName,
} from '@/shared/components/atoms/icons/AppIcon';
import { ProgressBar } from '@/shared/components/atoms/ProgressBar';
import { SectionHeader } from '@/shared/components/molecules/SectionHeader';
import { colors } from '@/shared/constants/theme';
import { useI18n } from '@/shared/i18n';
import { formatCurrency } from '@/shared/utils/format';

// Feature screen module.

const budgets = [
  {
    labelKey: 'categories.food',
    icon: 'food-outline',
    spent: 1_180_000,
    limit: 3_000_000,
    color: '#D86D4A',
  },
  {
    labelKey: 'categories.shopping',
    icon: 'shopping-outline',
    spent: 1_450_000,
    limit: 2_000_000,
    color: '#8067B6',
  },
  {
    labelKey: 'categories.transport',
    icon: 'car-outline',
    spent: 850_000,
    limit: 1_500_000,
    color: '#4D77D9',
  },
  {
    labelKey: 'categories.entertainment',
    icon: 'play-circle-outline',
    spent: 260_000,
    limit: 1_000_000,
    color: '#2C9B6A',
  },
] as const;

export default function BudgetsScreen() {
  const { t } = useI18n();
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerClassName="p-xl pb-[110px]"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-textMuted text-[10px] font-extrabold tracking-[1.1px]">
              {t('budgets.eyebrow')}
            </Text>
            <Text className="mt-1 text-text text-[28px] font-extrabold -tracking-[0.7px]">
              {t('budgets.title')}
            </Text>
          </View>
          <Pressable
            accessibilityLabel={t('budgets.add')}
            className="w-[42px] h-[42px] items-center justify-center rounded-[14px] bg-primary"
          >
            <AppIcon name="plus" size={20} color={colors.white} />
          </Pressable>
        </View>
        <View
          className={cn(
            uiClasses.rowBetween,
            'mt-6 p-xl rounded-lg bg-primary',
          )}
        >
          <View>
            <Text className="text-[rgba(255,255,255,0.62)] text-[10px] font-extrabold tracking-[1px]">
              {t('budgets.totalSpent')}
            </Text>
            <Text className="mt-[9px] text-white text-[25px] font-extrabold">
              {formatCurrency(totalSpent)}
            </Text>
            <Text className="mt-1.5 text-[rgba(255,255,255,0.62)] text-[11px]">
              {t('budgets.withinBudget')}
            </Text>
          </View>
          <View className="w-[82px] h-[82px] items-center justify-center border-[8px] border-income border-r-primarySoft rounded-[42px]">
            <Text className="text-white text-[16px] font-extrabold">31%</Text>
            <Text className="text-[rgba(255,255,255,0.62)] text-[9px] font-bold">
              {t('budgets.used')}
            </Text>
          </View>
        </View>
        <View className="flex-row gap-3 mt-4 p-md rounded-md bg-warningSoft">
          <View className="w-[34px] h-[34px] items-center justify-center rounded-[11px] bg-white">
            <AppIcon
              name="lightbulb-on-outline"
              size={19}
              color={colors.warning}
            />
          </View>
          <View className="flex-1">
            <Text className="text-text text-[13px] font-extrabold">
              {t('budgets.insightTitle')}
            </Text>
            <Text className="mt-[3px] text-textMuted text-[12px] leading-[17px]">
              {t('budgets.insightText')}
            </Text>
          </View>
        </View>
        <SectionHeader
          title={t('budgets.category')}
          actionLabel={t('common.manage')}
        />
        {budgets.map((budget) => {
          const progress = Math.min(budget.spent / budget.limit, 1);
          return (
            <View
              key={budget.labelKey}
              className="mb-3 p-md rounded-md bg-surface"
            >
              <View className={uiClasses.rowBetween}>
                <View className={cn(uiClasses.row, 'gap-2.5')}>
                  <View
                    className="w-[38px] h-[38px] items-center justify-center rounded-[12px]"
                    style={{ backgroundColor: `${budget.color}1A` }}
                  >
                    <AppIcon
                      name={budget.icon as AppIconName}
                      size={20}
                      color={budget.color}
                    />
                  </View>
                  <Text className="text-text text-[14px] font-extrabold">
                    {t(budget.labelKey)}
                  </Text>
                </View>
                <Text className="text-text text-[12px] font-extrabold">
                  {formatCurrency(budget.spent)}{' '}
                  <Text className="text-textSubtle font-semibold">
                    / {formatCurrency(budget.limit)}
                  </Text>
                </Text>
              </View>
              <ProgressBar progress={progress} color={budget.color} />
              <Text className="mt-[7px] text-textMuted text-[11px] font-semibold">
                {t('overview.remaining', {
                  amount: formatCurrency(budget.limit - budget.spent),
                })}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}
