import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/shared/components/atoms/ScreenContainer';
import { AppIcon } from '@/shared/components/atoms/icons/AppIcon';
import { ProgressBar } from '@/shared/components/atoms/ProgressBar';
import { StatCard } from '@/shared/components/molecules/StatCard';
import { SectionHeader } from '@/shared/components/molecules/SectionHeader';
import { TransactionRow } from '@/shared/components/molecules/TransactionRow';
import { colors, radii, spacing } from '@/shared/constants/theme';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/shared/utils/format';
import { useI18n } from '@/shared/i18n';

// Feature screen module.

export default function OverviewScreen() {
  const { accounts, transactions, isReady } = useFinance();
  const { t } = useI18n();
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const monthlyIncome = transactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthlySpent = transactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthlyBudget = 12_000_000;
  const budgetProgress = Math.min(monthlySpent / monthlyBudget, 1);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>{t('overview.dateLabel')}</Text>
            <Text style={styles.greeting}>{t('overview.greeting', { name: 'Cường' })}</Text>
          </View>
          <View style={styles.offlinePill}>
            <View style={styles.onlineDot} />
            <Text style={styles.offlineText}>{isReady ? t('common.offlineFirst') : t('common.loading')}</Text>
          </View>
        </View>

        <View style={styles.monthRow}>
          <Text style={styles.month}>{t('overview.month')}</Text>
          <AppIcon name="chevron-down" size={18} color={colors.textMuted} />
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceTopLine}>
            <Text style={styles.balanceLabel}>{t('overview.totalBalance')}</Text>
            <AppIcon name="eye-outline" size={21} color="rgba(255,255,255,0.72)" />
          </View>
          <Text style={styles.balance}>{formatCurrency(totalBalance)}</Text>
          <View style={styles.balanceFooter}>
            <Text style={styles.balanceHint}>{t('overview.allAccounts')}</Text>
            <View style={styles.balanceTrend}><AppIcon name="trending-up" size={14} color={colors.primary} /><Text style={styles.trendText}>+8,4%</Text></View>
          </View>
        </View>

        <View style={styles.metricRow}>
          <StatCard label={t('overview.income')} value={formatCurrency(monthlyIncome)} icon="arrow-bottom-left" tone="income" />
          <StatCard label={t('overview.spent')} value={formatCurrency(monthlySpent)} icon="arrow-top-right" tone="expense" />
        </View>

        <SectionHeader title={t('overview.monthlyBudget')} actionLabel={t('common.details')} />
        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}><Text style={styles.budgetTitle}>{t('overview.used')}</Text><Text style={styles.budgetValue}>{t('overview.budgetUsed', { spent: formatCurrency(monthlySpent), budget: formatCurrency(monthlyBudget) })}</Text></View>
          <ProgressBar progress={budgetProgress} />
          <View style={styles.budgetFooter}><Text style={styles.budgetCaption}>{t('overview.remaining', { amount: formatCurrency(monthlyBudget - monthlySpent) })}</Text><Text style={styles.budgetCaption}>{Math.round(budgetProgress * 100)}%</Text></View>
        </View>

        <SectionHeader title={t('overview.weeklySpending')} actionLabel={t('common.seeReport')} />
        <View style={styles.chartCard}>
          <View style={styles.chartBars}>{[42, 65, 30, 82, 52, 70, 38].map((height, index) => <View key={index} style={styles.barColumn}><View style={[styles.bar, { height }]} /><Text style={styles.barLabel}>{[t('days.monday'), t('days.tuesday'), t('days.wednesday'), t('days.thursday'), t('days.friday'), t('days.saturday'), t('days.sunday')][index]}</Text></View>)}</View>
        </View>

        <SectionHeader title={t('overview.recentTransactions')} actionLabel={t('common.seeAll')} onAction={() => router.push('/transactions')} />
        <View style={styles.transactionsCard}>{transactions.slice(0, 4).map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} account={accounts.find((account) => account.id === transaction.accountId)} />)}</View>
      </ScrollView>
      <Pressable accessibilityLabel={t('overview.addTransaction')} onPress={() => router.push('/add')} style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}><AppIcon name="plus" size={28} color={colors.white} /></Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: 116 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  greeting: { marginTop: 5, color: colors.text, fontSize: 27, fontWeight: '800', letterSpacing: -0.7 },
  wave: { fontSize: 22 },
  offlinePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: colors.surface, borderRadius: radii.pill },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.income },
  offlineText: { color: colors.textMuted, fontSize: 10, fontWeight: '700' },
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: spacing.xl, marginBottom: spacing.md },
  month: { color: colors.text, fontSize: 14, fontWeight: '800' },
  balanceCard: { padding: spacing.xl, backgroundColor: colors.primary, borderRadius: radii.lg, overflow: 'hidden' },
  balanceTopLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { color: 'rgba(255,255,255,0.62)', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  balance: { marginTop: 12, color: colors.white, fontSize: 30, fontWeight: '800', letterSpacing: -0.6 },
  balanceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 },
  balanceHint: { color: 'rgba(255,255,255,0.64)', fontSize: 12 },
  balanceTrend: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: radii.pill, backgroundColor: colors.primarySoft },
  trendText: { color: colors.primary, fontSize: 11, fontWeight: '800' },
  metricRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  budgetCard: { padding: spacing.lg, backgroundColor: colors.surface, borderRadius: radii.md },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budgetTitle: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  budgetValue: { color: colors.text, fontSize: 13, fontWeight: '800' },
  budgetTotal: { color: colors.textSubtle, fontWeight: '600' },
  budgetFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 },
  budgetCaption: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  chartCard: { padding: spacing.lg, backgroundColor: colors.surface, borderRadius: radii.md },
  chartBars: { height: 105, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  barColumn: { alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  bar: { width: 24, borderRadius: 8, backgroundColor: colors.primarySoft },
  barLabel: { color: colors.textSubtle, fontSize: 10, fontWeight: '700' },
  transactionsCard: { paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: radii.md },
  fab: { position: 'absolute', right: 24, bottom: 95, width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 29, backgroundColor: colors.primary, elevation: 5, shadowColor: colors.primary, shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  fabPressed: { transform: [{ scale: 0.95 }] },
});
