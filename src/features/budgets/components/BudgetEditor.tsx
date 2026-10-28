import { Text, View } from 'react-native';
import type { useBudgets } from '@/features/budgets/hooks/useBudgets';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { CategoryPicker } from '@/shared/components/molecules/CategoryPicker';
import { FormField } from '@/shared/components/molecules/FormField';
import { useI18n } from '@/shared/i18n';
import { uiClasses } from '@/shared/styles/classes';

export function BudgetEditor({
  model,
}: {
  model: ReturnType<typeof useBudgets>;
}) {
  const { t } = useI18n();
  if (!model.editor) return null;
  return (
    <View className="gap-md rounded-md bg-primarySoft p-md">
      <Text accessibilityRole="header" className={uiClasses.fieldLabel}>
        {t(model.editor.id ? 'budgets.editTitle' : 'budgets.add')}
      </Text>
      <Text className={uiClasses.hint}>{model.monthLabel}</Text>
      <CategoryPicker
        type="expense"
        selectedKey={model.editor.category}
        onChange={model.changeCategory}
        disabled={model.isSaving}
      />
      <FormField
        label={t('budgets.limit')}
        placeholder={t('budgets.limitPlaceholder')}
        keyboardType="number-pad"
        value={model.editor.amount}
        onChangeText={model.changeAmount}
        editable={!model.isSaving}
      />
      <Text className={uiClasses.hint}>{t('budgets.formHint')}</Text>
      <AppButton
        label={t(model.isSaving ? 'common.saving' : 'budgets.save')}
        onPress={model.saveEditor}
        disabled={model.isSaving}
      />
      <AppButton
        label={t('common.cancel')}
        variant="secondary"
        onPress={model.cancelEditor}
        disabled={model.isSaving}
      />
    </View>
  );
}
