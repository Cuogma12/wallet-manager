import { Text, View } from 'react-native';
import { BudgetCard } from '@/features/budgets/components/BudgetCard';
import { BudgetEditor } from '@/features/budgets/components/BudgetEditor';
import { useBudgets } from '@/features/budgets/hooks/useBudgets';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { MonthPicker } from '@/shared/components/molecules/MonthPicker';
import { FormScreen } from '@/shared/components/organisms/FormScreen';
import { useI18n } from '@/shared/i18n';
import { uiClasses } from '@/shared/styles/classes';
import { formatCurrency } from '@/shared/utils/format';

export default function BudgetsScreen() {
  const model = useBudgets();
  const { t } = useI18n();
  return (
    <FormScreen
      title={t('budgets.title')}
      onClose={model.back}
      isSaving={model.busy}
    >
      <MonthPicker
        month={model.month}
        monthLabel={model.monthLabel}
        previousMonth={model.previousMonth}
        nextMonth={model.nextMonth}
        disabled={model.busy}
      />
      <AppButton
        label={t('overview.currentMonth')}
        variant="secondary"
        onPress={model.currentMonth}
        disabled={model.busy}
      />
      <Text className={uiClasses.hint}>{t('budgets.hint')}</Text>
      {model.loadError && (
        <>
          <Text accessibilityRole="alert" className={uiClasses.error}>
            {t('common.loadFailed')}
          </Text>
          <AppButton
            label={t('common.retry')}
            onPress={model.refresh}
            disabled={model.isSaving}
          />
        </>
      )}
      {!!model.error && (
        <Text accessibilityRole="alert" className={uiClasses.error}>
          {model.error}
        </Text>
      )}
      <View className="gap-sm rounded-lg bg-primary p-lg">
        <Text className="text-sm font-bold text-white">
          {t('budgets.totalLimit')}
        </Text>
        <Text className="text-2xl font-extrabold text-white">
          {formatCurrency(model.summary.limit)}
        </Text>
        <Text className="text-sm text-white">
          {t('budgets.budgetedSpent', {
            amount: formatCurrency(model.summary.spent),
            percent: model.summary.percent,
          })}
        </Text>
        <Text className="text-sm text-white">
          {t('budgets.unbudgeted', {
            amount: formatCurrency(model.summary.unbudgeted),
          })}
        </Text>
      </View>
      {model.summary.alerts > 0 && (
        <Text
          accessibilityLiveRegion="polite"
          className="rounded-md bg-warningSoft p-md text-sm text-text"
        >
          {t('budgets.alerts', { count: model.summary.alerts })}
        </Text>
      )}
      <AppButton
        label={t('budgets.add')}
        onPress={model.openCreate}
        disabled={model.busy || !model.canAdd || model.loadError}
      />
      {!model.canAdd && (
        <Text className={uiClasses.hint}>{t('budgets.allSet')}</Text>
      )}
      <BudgetEditor model={model} />
      {model.pendingDelete && (
        <View className="gap-md rounded-md bg-warningSoft p-md">
          <Text accessibilityRole="header" className={uiClasses.fieldLabel}>
            {t('budgets.deleteTitle')}
          </Text>
          <Text className={uiClasses.hint}>{t('budgets.deleteHint')}</Text>
          <AppButton
            label={t('budgets.confirmDelete')}
            variant="danger"
            onPress={model.confirmDelete}
            disabled={model.isSaving}
          />
          <AppButton
            label={t('common.cancel')}
            variant="secondary"
            onPress={model.cancelDelete}
            disabled={model.isSaving}
          />
        </View>
      )}
      {model.summary.items.length === 0 && (
        <View className="gap-sm rounded-md bg-surface p-md">
          <Text className={uiClasses.fieldLabel}>
            {t('budgets.emptyTitle')}
          </Text>
          <Text className={uiClasses.hint}>{t('budgets.emptyText')}</Text>
        </View>
      )}
      {model.summary.items.map((item) => (
        <BudgetCard
          key={item.budget.id}
          item={item}
          disabled={model.busy || model.loadError}
          onEdit={model.openEdit}
          onDelete={model.askDelete}
        />
      ))}
    </FormScreen>
  );
}
