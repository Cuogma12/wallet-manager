import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { ScreenContainer } from '@/shared/components/atoms/ScreenContainer';
import { AppIcon } from '@/shared/components/atoms/icons/AppIcon';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { AppInput } from '@/shared/components/atoms/AppInput';
import { colors } from '@/shared/constants/theme';
import { inputScrollProps } from '@/shared/constants/inputBehavior';
import { useAddTransaction } from '@/features/add-transaction/hooks/useAddTransaction';
import { AccountPicker } from '@/shared/components/molecules/AccountPicker';
import { CategoryPicker } from '@/shared/components/molecules/CategoryPicker';
import { TransactionTypePicker } from '@/shared/components/molecules/TransactionTypePicker';
import { useI18n } from '@/shared/i18n';

// Feature screen module.

export default function AddTransactionScreen() {
  const form = useAddTransaction();
  const {
    accounts,
    type,
    setType,
    title,
    setTitle,
    category,
    accountId,
    setAccountId,
    note,
    setNote,
    error,
  } = form;
  const { t } = useI18n();

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="p-xl pb-11"
          {...inputScrollProps}
          showsVerticalScrollIndicator={false}
        >
          <View className={uiClasses.rowBetween}>
            <Pressable
              accessibilityLabel={t('add.close')}
              onPress={form.close}
              disabled={form.isSaving}
              className="w-11 h-11 items-center justify-center rounded-[13px] bg-surface"
            >
              <AppIcon name="close" size={22} color={colors.text} />
            </Pressable>
            <Text className="text-text text-[18px] font-extrabold">
              {t('add.title')}
            </Text>
            <View className="w-11" />
          </View>
          <View className="mt-lg">
            <TransactionTypePicker
              value={type}
              onChange={setType}
              disabled={form.isSaving}
            />
          </View>
          {type === 'income' && (
            <View className="mt-md gap-sm">
              <Text className={uiClasses.hint}>{t('add.salaryHint')}</Text>
              <AppButton
                label={t('accounts.recordSalary')}
                onPress={form.openSalary}
                disabled={form.isSaving}
                variant="secondary"
              />
            </View>
          )}
          <View className="items-center mt-6 p-xl rounded-lg bg-surface">
            <Text className="text-textMuted text-[10px] font-extrabold tracking-[1px]">
              {t('add.amount')}
            </Text>
            <View
              className={cn(
                uiClasses.row,
                'mt-1 w-full min-w-0 justify-center',
              )}
            >
              <AppInput
                accessibilityLabel={t('add.amount')}
                editable={!form.isSaving}
                autoFocus
                value={form.amountDisplay}
                onChangeText={form.changeAmount}
                keyboardType="numeric"
                placeholder={t('add.amountPlaceholder')}
                placeholderTextColor={colors.textSubtle}
                className={uiClasses.amountInput}
              />
              <Text className="ml-2 shrink-0 text-textMuted text-[20px] font-bold">
                {t('common.vnd')}
              </Text>
            </View>
          </View>
          <Text className="mt-[22px] mb-[9px] text-text text-[13px] font-extrabold">
            {t('add.transactionName')}
          </Text>
          <AppInput
            accessibilityLabel={t('add.transactionName')}
            editable={!form.isSaving}
            value={title}
            onChangeText={setTitle}
            placeholder={
              type === 'income'
                ? t('add.incomePlaceholder')
                : t('add.expensePlaceholder')
            }
            placeholderTextColor={colors.textSubtle}
            className={uiClasses.formInput}
          />
          {type === 'expense' && (
            <View className="mt-lg">
              <CategoryPicker
                type={type}
                selectedKey={category.key}
                onChange={form.changeCategory}
                disabled={form.isSaving}
              />
            </View>
          )}
          <View className="mt-lg">
            {accounts.length ? (
              <AccountPicker
                accounts={accounts}
                selectedId={accountId}
                onChange={setAccountId}
                label={t('add.account')}
                disabled={form.isSaving}
              />
            ) : (
              <View className="gap-md">
                <Text className={uiClasses.hint}>{t('add.noAccount')}</Text>
                <AppButton
                  label={t('accounts.addWallet')}
                  onPress={form.createAccount}
                />
              </View>
            )}
          </View>
          <Text className="mt-[22px] mb-[9px] text-text text-[13px] font-extrabold">
            {t('add.note')}{' '}
            <Text className="text-textSubtle font-medium">
              {t('add.optional')}
            </Text>
          </Text>
          <AppInput
            accessibilityLabel={t('add.note')}
            editable={!form.isSaving}
            value={note}
            onChangeText={setNote}
            placeholder={t('add.notePlaceholder')}
            placeholderTextColor={colors.textSubtle}
            className={cn(uiClasses.formInput, 'h-[78px] pt-3.5 align-top')}
            multiline
          />
          {error ? (
            <Text className="mt-3.5 text-expense text-[12px] font-bold">
              {error}
            </Text>
          ) : null}
          <View className="mt-lg">
            <AppButton
              label={t(form.isSaving ? 'common.saving' : 'add.save')}
              onPress={form.save}
              disabled={form.isSaving || !accounts.length}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
