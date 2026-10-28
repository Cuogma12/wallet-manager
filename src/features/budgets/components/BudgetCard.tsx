import { Text, View } from 'react-native';
import { IconButton } from '@/shared/components/atoms/IconButton';
import { ProgressBar } from '@/shared/components/atoms/ProgressBar';
import { AppIcon } from '@/shared/components/atoms/icons/AppIcon';
import { expenseCategories } from '@/shared/constants/categories';
import { colors } from '@/shared/constants/theme';
import { useI18n } from '@/shared/i18n';
import { uiClasses } from '@/shared/styles/classes';
import type { Budget } from '@/shared/types/budget';
import type { BudgetUsage } from '@/shared/utils/budgetSummary';
import { formatCurrency } from '@/shared/utils/format';

type Props = {
  item: BudgetUsage;
  disabled: boolean;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
};

export function BudgetCard({ item, disabled, onEdit, onDelete }: Props) {
  const { t } = useI18n();
  const category =
    expenseCategories.find((value) => value.key === item.budget.category) ??
    expenseCategories[5];
  const label = t(category.labelKey);
  return (
    <View className="gap-sm rounded-md bg-surface p-md">
      <View className={uiClasses.rowBetween}>
        <View className="min-w-0 flex-1 flex-row items-center gap-sm">
          <AppIcon name={category.icon} size={20} color={colors.primary} />
          <Text className="flex-1 text-sm font-extrabold text-text">
            {label}
          </Text>
        </View>
        <IconButton
          name="pencil-outline"
          accessibilityLabel={t('budgets.edit', { name: label })}
          onPress={() => onEdit(item.budget)}
          disabled={disabled}
        />
        <IconButton
          name="trash-can-outline"
          color={colors.error}
          accessibilityLabel={t('budgets.delete', { name: label })}
          onPress={() => onDelete(item.budget)}
          disabled={disabled}
        />
      </View>
      <Text className="text-sm font-bold text-text">
        {t('budgets.amounts', {
          spent: formatCurrency(item.spent),
          limit: formatCurrency(item.budget.limit),
        })}
      </Text>
      <ProgressBar
        progress={item.progress}
        color={
          item.status === 'normal'
            ? colors.income
            : item.status === 'near'
              ? colors.warning
              : colors.error
        }
      />
      <Text className="text-sm font-bold text-text">
        {t(`budgets.status.${item.status}`, { percent: item.percent })}
      </Text>
      <Text className={uiClasses.hint}>
        {t(item.remaining < 0n ? 'budgets.overrun' : 'overview.remaining', {
          amount: formatCurrency(
            item.remaining < 0n ? -item.remaining : item.remaining,
          ),
        })}
      </Text>
    </View>
  );
}
