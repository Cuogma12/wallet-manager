import { Pressable, Text, View } from 'react-native';
import { useManageAccount } from '@/features/manage-account/hooks/useManageAccount';
import { FormScreen } from '@/shared/components/organisms/FormScreen';
import { FormField } from '@/shared/components/molecules/FormField';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { AppIcon } from '@/shared/components/atoms/icons/AppIcon';
import { accountTypes } from '@/shared/constants/accountTypes';
import { colors } from '@/shared/constants/theme';
import { useI18n } from '@/shared/i18n';
import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';

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
          <FormField
            label={t('manageAccount.name')}
            placeholder={t('manageAccount.namePlaceholder')}
            value={form.name}
            onChangeText={form.setName}
            editable={!form.isSaving}
            maxLength={80}
          />
          <View className="gap-sm">
            <Text className={uiClasses.fieldLabel}>
              {t('manageAccount.type')}
            </Text>
            {accountTypes.map((item) => (
              <Pressable
                key={item.type}
                accessibilityRole="radio"
                accessibilityLabel={t(item.labelKey)}
                accessibilityState={{
                  selected: form.type === item.type,
                  disabled: form.isSaving,
                }}
                disabled={form.isSaving}
                onPress={() => form.setType(item.type)}
                className={cn(
                  uiClasses.row,
                  'min-h-[52px] gap-md rounded-md p-md bg-surface',
                  form.type === item.type && 'bg-primarySoft',
                )}
              >
                <AppIcon name={item.icon} size={22} color={colors.primary} />
                <Text className="flex-1 text-text font-semibold">
                  {t(item.labelKey)}
                </Text>
                {form.type === item.type && (
                  <AppIcon name="check" size={20} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
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
