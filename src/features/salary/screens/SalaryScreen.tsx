import { Switch, Text, View } from 'react-native';
import { useSalary } from '@/features/salary/hooks/useSalary';
import { FormScreen } from '@/shared/components/organisms/FormScreen';
import { FormField } from '@/shared/components/molecules/FormField';
import { AccountPicker } from '@/shared/components/molecules/AccountPicker';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { IconButton } from '@/shared/components/atoms/IconButton';
import { colors } from '@/shared/constants/theme';
import { useI18n } from '@/shared/i18n';
import { uiClasses } from '@/shared/styles/classes';

export default function SalaryScreen() {
  const form = useSalary();
  const { t } = useI18n();
  return (
    <FormScreen
      title={t('salary.title')}
      onClose={form.close}
      isSaving={form.isSaving}
    >
      {!form.accounts.length ? (
        <>
          <Text className={uiClasses.hint}>{t('salary.noAccount')}</Text>
          <AppButton
            label={t('accounts.addWallet')}
            onPress={form.createAccount}
          />
        </>
      ) : (
        <>
          <View className="gap-sm">
            <Text className={uiClasses.fieldLabel}>{t('salary.month')}</Text>
            <View className={uiClasses.rowBetween}>
              <IconButton
                name="chevron-left"
                accessibilityLabel={t('salary.previousMonth')}
                onPress={form.previousMonth}
                disabled={form.isSaving || form.month === '1900-01'}
              />
              <Text className="text-text font-bold">{form.monthLabel}</Text>
              <IconButton
                name="chevron-right"
                accessibilityLabel={t('salary.nextMonth')}
                onPress={form.nextMonth}
                disabled={form.isSaving || form.month === '9999-12'}
              />
            </View>
          </View>
          {form.alreadyRecorded && (
            <Text accessibilityRole="alert" className={uiClasses.error}>
              {t('salary.alreadyRecorded')}
            </Text>
          )}
          <FormField
            label={t('salary.amount')}
            placeholder={t('salary.amountPlaceholder')}
            value={form.amount}
            onChangeText={form.setAmount}
            keyboardType="number-pad"
            editable={!form.isSaving}
          />
          <FormField
            label={t('salary.receivedDate')}
            placeholder={t('salary.datePlaceholder')}
            hint={t('salary.dateHint')}
            value={form.date}
            onChangeText={form.setDate}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            editable={!form.isSaving}
          />
          <AccountPicker
            accounts={form.accounts}
            selectedId={form.accountId}
            onChange={form.setAccountId}
            label={t('salary.account')}
            disabled={form.isSaving}
          />
          <View className="gap-sm rounded-md bg-primarySoft p-md">
            <View className={uiClasses.rowBetween}>
              <Text className="flex-1 pr-sm text-text font-bold">
                {t('salary.included')}
              </Text>
              <View className="min-h-11 justify-center">
                <Switch
                  hitSlop={{ top: 7, bottom: 7 }}
                  accessibilityLabel={t('salary.included')}
                  value={form.includedInBalance}
                  onValueChange={form.setIncludedInBalance}
                  disabled={form.isSaving}
                  trackColor={{ true: colors.primary, false: colors.border }}
                />
              </View>
            </View>
            <Text className={uiClasses.hint}>{t('salary.includedHint')}</Text>
          </View>
          {form.error && (
            <Text accessibilityRole="alert" className={uiClasses.error}>
              {form.error}
            </Text>
          )}
          <AppButton
            label={t(form.isSaving ? 'common.saving' : 'salary.save')}
            onPress={form.save}
            disabled={form.isSaving || form.alreadyRecorded}
          />
        </>
      )}
    </FormScreen>
  );
}
