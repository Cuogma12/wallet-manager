import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '@/shared/components/atoms/ScreenContainer';
import { AppIcon, type AppIconName } from '@/shared/components/atoms/icons/AppIcon';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { colors, radii, spacing } from '@/shared/constants/theme';
import { expenseCategories } from '@/shared/constants/categories';
import { useFinance } from '@/context/FinanceContext';
import type { TransactionType } from '@/shared/types/finance';
import { useI18n } from '@/shared/i18n';

// Feature screen module.

export default function AddTransactionScreen() {
  const { accounts, addTransaction } = useFinance();
  const { t, intlLocale } = useI18n();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<(typeof expenseCategories)[number]>(expenseCategories[0]);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? 'cash');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const amountNumber = useMemo(() => Number(amount.replace(/\D/g, '')), [amount]);

  async function handleSave() {
    if (!amountNumber) {
      setError(t('add.amountRequired'));
      return;
    }
    if (!title.trim()) {
      setError(t('add.titleRequired'));
      return;
    }
    await addTransaction({
      accountId,
      title: title.trim(),
      amount: amountNumber,
      type,
      category: type === 'income' ? 'salary' : category.key,
      categoryIcon: type === 'income' ? 'cash-plus' : category.icon,
      occurredAt: new Date().toISOString(),
      note: note.trim(),
    });
    router.back();
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}><Pressable accessibilityLabel={t('add.close')} onPress={() => router.back()} style={styles.close}><AppIcon name="close" size={22} color={colors.text} /></Pressable><Text style={styles.title}>{t('add.title')}</Text><View style={styles.closePlaceholder} /></View>
          <View style={styles.typeSwitch}>{(['expense', 'income'] as const).map((item) => <Pressable key={item} onPress={() => setType(item)} style={[styles.typeOption, type === item && styles.typeOptionActive]}><Text style={[styles.typeText, type === item && styles.typeTextActive]}>{item === 'expense' ? t('add.expense') : t('add.income')}</Text></Pressable>)}</View>
          <View style={styles.amountBox}><Text style={styles.amountLabel}>{t('add.amount')}</Text><View style={styles.amountRow}><TextInput autoFocus value={amount ? Number(amount).toLocaleString(intlLocale) : ''} onChangeText={(value) => setAmount(value.replace(/\D/g, ''))} keyboardType="numeric" placeholder={t('add.amountPlaceholder')} placeholderTextColor={colors.textSubtle} style={styles.amountInput} /><Text style={styles.currency}>{t('common.vnd')}</Text></View></View>
          <Text style={styles.fieldLabel}>{t('add.transactionName')}</Text><TextInput value={title} onChangeText={setTitle} placeholder={type === 'income' ? t('add.incomePlaceholder') : t('add.expensePlaceholder')} placeholderTextColor={colors.textSubtle} style={styles.input} />
          {type === 'expense' && <><Text style={styles.fieldLabel}>{t('add.category')}</Text><View style={styles.categoryGrid}>{expenseCategories.map((item) => <Pressable key={item.key} onPress={() => setCategory(item)} style={[styles.category, category.key === item.key && styles.categoryActive]}><AppIcon name={item.icon as AppIconName} size={19} color={category.key === item.key ? colors.white : colors.primary} /><Text style={[styles.categoryText, category.key === item.key && styles.categoryTextActive]}>{t(item.labelKey)}</Text></Pressable>)}</View></>}
          <Text style={styles.fieldLabel}>{t('add.account')}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.accountList}>{accounts.map((account) => <Pressable key={account.id} onPress={() => setAccountId(account.id)} style={[styles.accountChoice, accountId === account.id && styles.accountChoiceActive]}><AppIcon name={account.icon as AppIconName} size={18} color={accountId === account.id ? colors.white : colors.primary} /><Text style={[styles.accountChoiceText, accountId === account.id && styles.accountChoiceTextActive]}>{account.name}</Text></Pressable>)}</ScrollView>
          <Text style={styles.fieldLabel}>{t('add.note')} <Text style={styles.optional}>{t('add.optional')}</Text></Text><TextInput value={note} onChangeText={setNote} placeholder={t('add.notePlaceholder')} placeholderTextColor={colors.textSubtle} style={[styles.input, styles.noteInput]} multiline />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <AppButton label={t('add.save')} onPress={handleSave} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: 44 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: colors.surface },
  closePlaceholder: { width: 40 },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  typeSwitch: { flexDirection: 'row', marginTop: 26, padding: 4, borderRadius: 15, backgroundColor: colors.surfaceMuted },
  typeOption: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 11 },
  typeOptionActive: { backgroundColor: colors.primary },
  typeText: { color: colors.textMuted, fontSize: 13, fontWeight: '800' },
  typeTextActive: { color: colors.white },
  amountBox: { alignItems: 'center', marginTop: 24, padding: spacing.xl, borderRadius: radii.lg, backgroundColor: colors.surface },
  amountLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  amountRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  amountInput: { minWidth: 120, color: colors.text, fontSize: 38, fontWeight: '800', textAlign: 'right' },
  currency: { marginLeft: 8, color: colors.textMuted, fontSize: 20, fontWeight: '700' },
  fieldLabel: { marginTop: 22, marginBottom: 9, color: colors.text, fontSize: 13, fontWeight: '800' },
  optional: { color: colors.textSubtle, fontWeight: '500' },
  input: { paddingHorizontal: 15, height: 50, borderRadius: 14, backgroundColor: colors.surface, color: colors.text, fontSize: 14 },
  noteInput: { height: 78, paddingTop: 14, textAlignVertical: 'top' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  category: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.surface },
  categoryActive: { backgroundColor: colors.primary },
  categoryText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  categoryTextActive: { color: colors.white },
  accountList: { gap: 8 },
  accountChoice: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.surface },
  accountChoiceActive: { backgroundColor: colors.primary },
  accountChoiceText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  accountChoiceTextActive: { color: colors.white },
  error: { marginTop: 14, color: colors.expense, fontSize: 12, fontWeight: '700' },
});
