import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '@/shared/components/atoms/ScreenContainer';
import { AppIcon } from '@/shared/components/atoms/icons/AppIcon';
import { IconButton } from '@/shared/components/atoms/IconButton';
import { SectionHeader } from '@/shared/components/molecules/SectionHeader';
import { TransactionRow } from '@/shared/components/molecules/TransactionRow';
import { colors, radii, spacing } from '@/shared/constants/theme';
import { useI18n } from '@/shared/i18n';
import { useFinance } from '@/context/FinanceContext';

// Feature screen module.

type Filter = 'all' | 'expense' | 'income';

export default function TransactionsScreen() {
  const { accounts, transactions } = useFinance();
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const filteredTransactions = useMemo(() => transactions.filter((transaction) => {
    const matchesFilter = filter === 'all' || transaction.type === filter;
    const matchesSearch = `${transaction.title} ${transaction.category}`.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  }), [filter, search, transactions]);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><View><Text style={styles.eyebrow}>{t('transactions.eyebrow')}</Text><Text style={styles.title}>{t('transactions.title')}</Text></View><IconButton name="tune-variant" accessibilityLabel={t('transactions.filter')} /></View>
        <View style={styles.searchBox}><AppIcon name="magnify" size={20} color={colors.textMuted} /><TextInput value={search} onChangeText={setSearch} placeholder={t('transactions.searchPlaceholder')} placeholderTextColor={colors.textSubtle} style={styles.searchInput} /></View>
        <View style={styles.filters}>{([['all', t('transactions.all')], ['expense', t('transactions.expenses')], ['income', t('transactions.income')]] as const).map(([value, label]) => <Pressable key={value} onPress={() => setFilter(value)} style={[styles.filter, filter === value && styles.filterActive]}><Text style={[styles.filterText, filter === value && styles.filterTextActive]}>{label}</Text></Pressable>)}</View>
        <SectionHeader title={t('transactions.resultCount', { count: filteredTransactions.length })} />
        <View style={styles.listCard}>{filteredTransactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} account={accounts.find((account) => account.id === transaction.accountId)} />)}</View>
        {filteredTransactions.length === 0 && <View style={styles.empty}><AppIcon name="file-search-outline" size={38} color={colors.textSubtle} /><Text style={styles.emptyTitle}>{t('transactions.emptyTitle')}</Text><Text style={styles.emptyText}>{t('transactions.emptyText')}</Text></View>}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: 110 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  title: { marginTop: 4, color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.7 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 24, paddingHorizontal: 14, height: 48, borderRadius: 14, backgroundColor: colors.surface },
  searchInput: { flex: 1, color: colors.text, fontSize: 14 },
  filters: { flexDirection: 'row', gap: 8, marginTop: 16 },
  filter: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radii.pill, backgroundColor: colors.surface },
  filterActive: { backgroundColor: colors.primary },
  filterText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: colors.white },
  listCard: { paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: radii.md },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { marginTop: 12, color: colors.text, fontSize: 16, fontWeight: '800' },
  emptyText: { marginTop: 5, color: colors.textMuted, fontSize: 13 },
});
