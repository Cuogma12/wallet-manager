import { Text, View } from 'react-native';
import type { useAddTransaction } from '@/features/add-transaction/hooks/useAddTransaction';
import { TransactionDateField } from '@/features/add-transaction/components/TransactionDateField';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { AppInput } from '@/shared/components/atoms/AppInput';
import { AccountPicker } from '@/shared/components/molecules/AccountPicker';
import { CategoryPicker } from '@/shared/components/molecules/CategoryPicker';
import { FormField } from '@/shared/components/molecules/FormField';
import { useI18n } from '@/shared/i18n';
import { cn } from '@/shared/styles/cn';
import { uiClasses } from '@/shared/styles/classes';

export function TransactionDetailsSection({
  model,
}: {
  model: ReturnType<typeof useAddTransaction>;
}) {
  const { t } = useI18n();
  if (!model.showDetails) return null;
  return (
    <View className="gap-lg rounded-md bg-surfaceMuted p-md">
      <FormField
        label={t('add.transactionName')}
        hint={t('add.transactionNameHint')}
        editable={!model.isSaving}
        value={model.title}
        onChangeText={model.changeTitle}
        placeholder={
          model.type === 'income'
            ? t('add.incomePlaceholder')
            : t('add.expensePlaceholder')
        }
      />
      <TransactionDateField model={model.transactionDate} />
      {model.type === 'expense' && (
        <CategoryPicker
          type="expense"
          selectedKey={model.category}
          onChange={model.changeCategory}
          customCategories={model.customCategories}
          disabled={model.isSaving}
        />
      )}
      {model.accounts.length ? (
        <AccountPicker
          accounts={model.accounts}
          selectedId={model.accountId}
          onChange={model.changeAccount}
          label={t('add.account')}
          disabled={model.isSaving}
        />
      ) : (
        <View className="gap-md">
          <Text className={uiClasses.hint}>{t('add.noAccount')}</Text>
          <AppButton
            label={t('accounts.addWallet')}
            onPress={model.createAccount}
          />
        </View>
      )}
      <View className="gap-sm">
        <Text className={uiClasses.fieldLabel}>
          {t('add.note')}{' '}
          <Text className="font-medium text-textSubtle">
            {t('add.optional')}
          </Text>
        </Text>
        <AppInput
          accessibilityLabel={t('add.note')}
          editable={!model.isSaving}
          value={model.note}
          onChangeText={model.changeNote}
          placeholder={t('add.notePlaceholder')}
          className={cn(uiClasses.formInput, 'h-[78px] pt-3.5 align-top')}
          multiline
        />
      </View>
    </View>
  );
}
