import { Text } from 'react-native';
import { useManageAccount } from '@/features/manage-account/hooks/useManageAccount';
import { FormScreen } from '@/shared/components/organisms/FormScreen';
import { FormField } from '@/shared/components/molecules/FormField';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { AccountTypePicker } from '@/shared/components/molecules/AccountTypePicker';
import { AccountProviderField } from '@/features/manage-account/components/AccountProviderField';
import { useI18n } from '@/shared/i18n';
import { uiClasses } from '@/shared/styles/classes';

export default function ManageAccountScreen() {
  const form = useManageAccount();
  const { t } = useI18n();
  return (
    <FormScreen
      title={t(
        form.editing ? 'manageAccount.editTitle' : 'manageAccount.createTitle',
      )}
      onClose={form.close}
      isSaving={form.isSaving}
    >
      {form.notFound ? (
        <Text className={uiClasses.error}>
          {t('financeErrors.accountNotFound')}
        </Text>
      ) : (
        <>
          <AccountTypePicker
            value={form.type}
            onChange={form.setType}
            disabled={form.isSaving}
          />
          {form.type !== 'cash' && (
            <AccountProviderField
              type={form.type}
              providerId={form.providerId}
              selected={form.selectedProvider}
              providers={form.providerSearch.providers}
              query={form.providerSearch.query}
              onQueryChange={form.providerSearch.setQuery}
              expanded={form.providerPickerExpanded}
              onToggle={form.toggleProviderPicker}
              onSelect={form.selectProvider}
              disabled={form.isSaving}
            />
          )}
          <FormField
            label={t('manageAccount.name')}
            placeholder={t('manageAccount.namePlaceholder')}
            value={form.name}
            onChangeText={form.setName}
            editable={!form.isSaving}
            maxLength={80}
          />
          <FormField
            label={t('manageAccount.balance')}
            placeholder={t('manageAccount.balancePlaceholder')}
            hint={t('manageAccount.balanceHint')}
            value={form.balance}
            onChangeText={form.setBalance}
            keyboardType="numbers-and-punctuation"
            editable={!form.isSaving}
          />
          {form.editing && (
            <Text className={uiClasses.hint}>
              {t('manageAccount.editHint')}
            </Text>
          )}
          {form.error && (
            <Text accessibilityRole="alert" className={uiClasses.error}>
              {form.error}
            </Text>
          )}
          <AppButton
            label={t(form.isSaving ? 'common.saving' : 'manageAccount.save')}
            onPress={form.save}
            disabled={form.isSaving}
          />
        </>
      )}
    </FormScreen>
  );
}
