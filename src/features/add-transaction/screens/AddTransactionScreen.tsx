import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { PasteNotificationPanel } from '@/features/add-transaction/components/PasteNotificationPanel';
import { RecentTransactionTemplates } from '@/features/add-transaction/components/RecentTransactionTemplates';
import { TransactionDetailsSection } from '@/features/add-transaction/components/TransactionDetailsSection';
import { TransactionEntryModePicker } from '@/features/add-transaction/components/TransactionEntryModePicker';
import { useAddTransaction } from '@/features/add-transaction/hooks/useAddTransaction';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { AppInput } from '@/shared/components/atoms/AppInput';
import { ScreenContainer } from '@/shared/components/atoms/ScreenContainer';
import { AppIcon } from '@/shared/components/atoms/icons/AppIcon';
import { TransactionTypePicker } from '@/shared/components/molecules/TransactionTypePicker';
import { inputScrollProps } from '@/shared/constants/inputBehavior';
import { colors } from '@/shared/constants/theme';
import { useI18n } from '@/shared/i18n';
import { cn } from '@/shared/styles/cn';
import { uiClasses } from '@/shared/styles/classes';

export default function AddTransactionScreen() {
  const form = useAddTransaction();
  const { t } = useI18n();

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="gap-lg p-xl pb-11"
          {...inputScrollProps}
          showsVerticalScrollIndicator={false}
        >
          <View className={uiClasses.rowBetween}>
            <Pressable
              accessibilityLabel={t('add.close')}
              onPress={form.close}
              disabled={form.isSaving}
              className="h-11 w-11 items-center justify-center rounded-[13px] bg-surface"
            >
              <AppIcon name="close" size={22} color={colors.text} />
            </Pressable>
            <Text className="text-[18px] font-extrabold text-text">
              {t('add.title')}
            </Text>
            <View className="w-11" />
          </View>

          <TransactionEntryModePicker
            value={form.mode}
            onChange={form.setMode}
            disabled={form.isSaving}
          />

          {form.mode === 'quick' ? (
            <RecentTransactionTemplates
              templates={form.templates}
              accountName={form.templateAccountName}
              onSelect={form.applyTemplate}
              disabled={form.isSaving}
            />
          ) : (
            <PasteNotificationPanel
              value={form.pasteText}
              onChange={form.setPasteText}
              onAnalyze={form.analyzePaste}
              ready={form.pasteReady}
              error={form.pasteError}
              canAnalyze={form.canAnalyzePaste}
              disabled={form.isSaving}
            />
          )}

          <TransactionTypePicker
            value={form.type}
            onChange={form.changeType}
            disabled={form.isSaving}
          />
          {form.type === 'income' && (
            <View className="gap-sm">
              <Text className={uiClasses.hint}>{t('add.salaryHint')}</Text>
              <AppButton
                label={t('accounts.recordSalary')}
                onPress={form.openSalary}
                disabled={form.isSaving}
                variant="secondary"
              />
            </View>
          )}

          <View className="items-center rounded-lg bg-surface p-xl">
            <Text className="text-[10px] font-extrabold tracking-[1px] text-textMuted">
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
                onBlur={form.blurAmount}
                keyboardType="numeric"
                placeholder={t('add.amountPlaceholder')}
                className={uiClasses.amountInput}
              />
              <Text className="ml-2 shrink-0 text-[20px] font-bold text-textMuted">
                {t('common.vnd')}
              </Text>
            </View>
            {form.amountPreview !== '' && (
              <Text className={cn(uiClasses.hint, 'mt-sm text-center')}>
                {t('add.amountPreview', { amount: form.amountPreview })}
              </Text>
            )}
          </View>

          <View className="gap-xs rounded-md bg-primarySoft p-md">
            <Text className="text-sm font-extrabold text-text">
              {form.displayTitle}
            </Text>
            <Text className={uiClasses.hint}>
              {t('add.summary', {
                category: form.summaryCategory,
                account: form.selectedAccountName || t('add.noAccountShort'),
                date: form.transactionDate.date,
              })}
            </Text>
          </View>

          <AppButton
            label={t(form.showDetails ? 'add.hideDetails' : 'add.showDetails')}
            variant="secondary"
            onPress={form.toggleDetails}
            disabled={form.isSaving}
          />
          <TransactionDetailsSection model={form} />

          {!!form.error && (
            <Text accessibilityRole="alert" className={uiClasses.error}>
              {form.error}
            </Text>
          )}
          {form.mode === 'paste' && !form.pasteReady && (
            <Text className={uiClasses.hint}>{t('add.paste.saveHint')}</Text>
          )}
          <AppButton
            label={t(form.isSaving ? 'common.saving' : 'add.save')}
            onPress={form.save}
            disabled={form.isSaving || !form.canSave}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
