import { Text, View } from 'react-native';
import { useTransactionDetail } from '@/features/transaction-detail/hooks/useTransactionDetail';
import { TransactionDetails } from '@/features/transaction-detail/components/TransactionDetails';
import { TransactionEditForm } from '@/features/transaction-detail/components/TransactionEditForm';
import { FormScreen } from '@/shared/components/organisms/FormScreen';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { useI18n } from '@/shared/i18n';
import { uiClasses } from '@/shared/styles/classes';

export default function TransactionDetailScreen() {
  const form = useTransactionDetail();
  const { t } = useI18n();
  return (
    <FormScreen
      title={t(
        form.isEditing ? 'transactionDetail.edit' : 'transactionDetail.title',
      )}
      onClose={form.isEditing ? form.cancelEdit : form.close}
      isSaving={form.isSaving}
    >
      {form.loadError && (
        <View className="gap-sm">
          <Text accessibilityRole="alert" className={uiClasses.error}>
            {t('common.loadFailed')}
          </Text>
          <AppButton label={t('common.retry')} onPress={form.refresh} />
        </View>
      )}
      {!form.transaction ? (
        <Text className={uiClasses.hint}>
          {t('financeErrors.transactionNotFound')}
        </Text>
      ) : form.isEditing ? (
        <TransactionEditForm form={form} />
      ) : (
        <>
          <TransactionDetails
            transaction={form.transaction}
            accountName={form.account?.name ?? t('add.account')}
            categoryLabel={form.categoryLabel}
            dateLabel={form.dateLabel}
          />
          {form.editable ? (
            <>
              <AppButton
                label={t('transactionDetail.edit')}
                onPress={form.edit}
                disabled={form.isSaving || form.confirmingDelete}
              />
              {!form.confirmingDelete ? (
                <AppButton
                  label={t('transactionDetail.delete')}
                  onPress={form.askDelete}
                  variant="danger"
                  disabled={form.isSaving}
                />
              ) : (
                <View className="gap-md rounded-md bg-surface p-lg">
                  <Text
                    accessibilityRole="header"
                    className={uiClasses.fieldLabel}
                  >
                    {t('transactionDetail.deleteTitle')}
                  </Text>
                  <Text className={uiClasses.hint}>
                    {t('transactionDetail.deleteHint')}
                  </Text>
                  <AppButton
                    label={t(
                      form.isSaving
                        ? 'common.saving'
                        : 'transactionDetail.confirmDelete',
                    )}
                    onPress={form.remove}
                    variant="danger"
                    disabled={form.isSaving}
                  />
                  <AppButton
                    label={t('common.cancel')}
                    onPress={form.cancelDelete}
                    variant="secondary"
                    disabled={form.isSaving}
                  />
                </View>
              )}
            </>
          ) : (
            <Text className={uiClasses.hint}>
              {t('transactionDetail.readOnly')}
            </Text>
          )}
        </>
      )}
      {!!form.error && (
        <Text accessibilityRole="alert" className={uiClasses.error}>
          {form.error}
        </Text>
      )}
    </FormScreen>
  );
}
