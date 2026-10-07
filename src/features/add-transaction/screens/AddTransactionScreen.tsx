import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScreenContainer } from '@/shared/components/atoms/ScreenContainer';
import {
  AppIcon,
  type AppIconName,
} from '@/shared/components/atoms/icons/AppIcon';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { colors } from '@/shared/constants/theme';
import { expenseCategories } from '@/shared/constants/categories';
import { useAddTransaction } from '@/features/add-transaction/hooks/useAddTransaction';
import { AccountPicker } from '@/shared/components/molecules/AccountPicker';
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
    setCategory,
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
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
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
          <View className="flex-row mt-[26px] p-1 rounded-[15px] bg-surfaceMuted">
            {(['expense', 'income'] as const).map((item) => (
              <Pressable
                key={item}
                disabled={form.isSaving}
                onPress={() => setType(item)}
                className={cn(
                  'flex-1 min-h-11 items-center py-[11px] rounded-[11px]',
                  type === item && 'bg-primary',
                )}
              >
                <Text
                  className={cn(
                    'text-textMuted text-[13px] font-extrabold',
                    type === item && 'text-white',
                  )}
                >
                  {item === 'expense' ? t('add.expense') : t('add.income')}
                </Text>
              </Pressable>
            ))}
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
            <View className={cn(uiClasses.row, 'mt-1')}>
              <TextInput
                accessibilityLabel={t('add.amount')}
                editable={!form.isSaving}
                autoFocus
                value={form.amountDisplay}
                onChangeText={form.changeAmount}
                keyboardType="numeric"
                placeholder={t('add.amountPlaceholder')}
                placeholderTextColor={colors.textSubtle}
                className="min-w-[120px] text-text text-[38px] font-extrabold text-right"
              />
              <Text className="ml-2 text-textMuted text-[20px] font-bold">
                {t('common.vnd')}
              </Text>
            </View>
          </View>
          <Text className="mt-[22px] mb-[9px] text-text text-[13px] font-extrabold">
            {t('add.transactionName')}
          </Text>
          <TextInput
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
            className="px-[15px] h-[50px] rounded-[14px] bg-surface text-text text-[14px]"
          />
          {type === 'expense' && (
            <>
              <Text className="mt-[22px] mb-[9px] text-text text-[13px] font-extrabold">
                {t('add.category')}
              </Text>
              <View className="flex-row flex-wrap gap-[9px]">
                {expenseCategories.map((item) => (
                  <Pressable
                    key={item.key}
                    disabled={form.isSaving}
                    onPress={() => setCategory(item)}
                    className={cn(
                      'flex-row min-h-11 items-center gap-1.5 px-3 py-2.5 rounded-[12px] bg-surface',
                      category.key === item.key && 'bg-primary',
                    )}
                  >
                    <AppIcon
                      name={item.icon as AppIconName}
                      size={19}
                      color={
                        category.key === item.key
                          ? colors.white
                          : colors.primary
                      }
                    />
                    <Text
                      className={cn(
                        'text-textMuted text-[11px] font-bold',
                        category.key === item.key && 'text-white',
                      )}
                    >
                      {t(item.labelKey)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
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
          <TextInput
            accessibilityLabel={t('add.note')}
            editable={!form.isSaving}
            value={note}
            onChangeText={setNote}
            placeholder={t('add.notePlaceholder')}
            placeholderTextColor={colors.textSubtle}
            className={cn(
              'px-[15px] h-[50px] rounded-[14px] bg-surface text-text text-[14px]',
              'h-[78px] pt-3.5 align-top',
            )}
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
