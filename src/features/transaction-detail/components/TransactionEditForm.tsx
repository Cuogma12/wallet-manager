import { Text } from 'react-native';
import type { useTransactionDetail } from '@/features/transaction-detail/hooks/useTransactionDetail';
import { FormField } from '@/shared/components/molecules/FormField';
import { AccountPicker } from '@/shared/components/molecules/AccountPicker';
import { CategoryPicker } from '@/shared/components/molecules/CategoryPicker';
import { TransactionTypePicker } from '@/shared/components/molecules/TransactionTypePicker';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { useI18n } from '@/shared/i18n';
import { uiClasses } from '@/shared/styles/classes';

export function TransactionEditForm({
  form,
}: {
  form: ReturnType<typeof useTransactionDetail>;
}) {
  const { t } = useI18n();
  return (
    <>
      <Text className={uiClasses.hint}>
        {t('transactionDetail.balanceHint')}
      </Text>
      <TransactionTypePicker
        value={form.fields.type}
        onChange={form.changeType}
        disabled={form.isSaving}
      />
      <FormField
        label={t('add.transactionName')}
        value={form.fields.title}
        onChangeText={(value) => form.change('title', value)}
        editable={!form.isSaving}
      />
      <FormField
        label={t('transactionDetail.amount')}
        value={form.fields.amount}
        onChangeText={(value) => form.change('amount', value)}
        keyboardType="number-pad"
        editable={!form.isSaving}
      />
      <FormField
        label={t('transactionDetail.date')}
        placeholder={t('salary.datePlaceholder')}
        value={form.fields.date}
        onChangeText={(value) => form.change('date', value)}
        keyboardType="numbers-and-punctuation"
        maxLength={10}
        editable={!form.isSaving}
      />
      <AccountPicker
        accounts={form.accounts}
        label={t('add.account')}
        selectedId={form.fields.accountId}
        onChange={(value) => form.change('accountId', value)}
        disabled={form.isSaving}
      />
      <CategoryPicker
        type={form.fields.type}
        selectedKey={form.fields.category}
        onChange={(value) => form.change('category', value)}
        disabled={form.isSaving}
      />
      {form.fields.type === 'income' && form.fields.category === 'salary' && (
        <FormField
          label={t('salary.month')}
          hint={t('transactionDetail.salaryMonthHint')}
          value={form.fields.salaryMonth}
          onChangeText={(value) => form.change('salaryMonth', value)}
          maxLength={7}
          editable={!form.isSaving}
        />
      )}
      <FormField
        label={t('add.note')}
        value={form.fields.note}
        onChangeText={(value) => form.change('note', value)}
        multiline
        editable={!form.isSaving}
      />
      <AppButton
        label={t(form.isSaving ? 'common.saving' : 'transactionDetail.save')}
        onPress={form.save}
        disabled={form.isSaving || !form.accounts.length}
      />
      <AppButton
        label={t('common.cancel')}
        onPress={form.cancelEdit}
        disabled={form.isSaving}
        variant="secondary"
      />
    </>
  );
}
