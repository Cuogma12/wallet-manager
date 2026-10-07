import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/shared/components/atoms/ScreenContainer';
import { AppIcon, type AppIconName } from '@/shared/components/atoms/icons/AppIcon';
import { ProgressBar } from '@/shared/components/atoms/ProgressBar';
import { SectionHeader } from '@/shared/components/molecules/SectionHeader';
import { colors, radii, spacing } from '@/shared/constants/theme';
import { useI18n } from '@/shared/i18n';
import { formatCurrency } from '@/shared/utils/format';

// Feature screen module.

const budgets = [
  { labelKey: 'categories.food', icon: 'food-outline', spent: 1_180_000, limit: 3_000_000, color: '#D86D4A' },
  { labelKey: 'categories.shopping', icon: 'shopping-outline', spent: 1_450_000, limit: 2_000_000, color: '#8067B6' },
  { labelKey: 'categories.transport', icon: 'car-outline', spent: 850_000, limit: 1_500_000, color: '#4D77D9' },
  { labelKey: 'categories.entertainment', icon: 'play-circle-outline', spent: 260_000, limit: 1_000_000, color: '#2C9B6A' },
] as const;

export default function BudgetsScreen() {
  const { t } = useI18n();
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>{t('budgets.eyebrow')}</Text><Text style={styles.title}>{t('budgets.title')}</Text></View>
          <Pressable accessibilityLabel={t('budgets.add')} style={styles.addButton}><AppIcon name="plus" size={20} color={colors.white} /></Pressable>
        </View>
        <View style={styles.summaryCard}>
          <View><Text style={styles.summaryLabel}>{t('budgets.totalSpent')}</Text><Text style={styles.summaryValue}>{formatCurrency(totalSpent)}</Text><Text style={styles.summaryHint}>{t('budgets.withinBudget')}</Text></View>
          <View style={styles.donut}><Text style={styles.donutText}>31%</Text><Text style={styles.donutCaption}>{t('budgets.used')}</Text></View>
        </View>
        <View style={styles.insight}>
          <View style={styles.insightIcon}><AppIcon name="lightbulb-on-outline" size={19} color={colors.warning} /></View>
          <View style={styles.insightBody}><Text style={styles.insightTitle}>{t('budgets.insightTitle')}</Text><Text style={styles.insightText}>{t('budgets.insightText')}</Text></View>
        </View>
        <SectionHeader title={t('budgets.category')} actionLabel={t('common.manage')} />
        {budgets.map((budget) => {
          const progress = Math.min(budget.spent / budget.limit, 1);
          return (
            <View key={budget.labelKey} style={styles.budgetCard}>
              <View style={styles.budgetTop}>
                <View style={styles.budgetName}><View style={[styles.categoryIcon, { backgroundColor: `${budget.color}1A` }]}><AppIcon name={budget.icon as AppIconName} size={20} color={budget.color} /></View><Text style={styles.budgetTitle}>{t(budget.labelKey)}</Text></View>
                <Text style={styles.budgetAmount}>{formatCurrency(budget.spent)} <Text style={styles.limit}>/ {formatCurrency(budget.limit)}</Text></Text>
              </View>
              <ProgressBar progress={progress} color={budget.color} />
              <Text style={styles.remaining}>{t('overview.remaining', { amount: formatCurrency(budget.limit - budget.spent) })}</Text>
            </View>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: 110 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  title: { marginTop: 4, color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.7 },
  addButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.primary },
  summaryCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, padding: spacing.xl, borderRadius: radii.lg, backgroundColor: colors.primary },
  summaryLabel: { color: 'rgba(255,255,255,0.62)', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  summaryValue: { marginTop: 9, color: colors.white, fontSize: 25, fontWeight: '800' },
  summaryHint: { marginTop: 6, color: 'rgba(255,255,255,0.62)', fontSize: 11 },
  donut: { width: 82, height: 82, alignItems: 'center', justifyContent: 'center', borderWidth: 8, borderColor: colors.income, borderRightColor: colors.primarySoft, borderRadius: 42 },
  donutText: { color: colors.white, fontSize: 16, fontWeight: '800' },
  donutCaption: { color: 'rgba(255,255,255,0.62)', fontSize: 9, fontWeight: '700' },
  insight: { flexDirection: 'row', gap: 12, marginTop: 16, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.warningSoft },
  insightIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: colors.white },
  insightBody: { flex: 1 },
  insightTitle: { color: colors.text, fontSize: 13, fontWeight: '800' },
  insightText: { marginTop: 3, color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  budgetCard: { marginBottom: 12, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.surface },
  budgetTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  budgetName: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  categoryIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  budgetTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  budgetAmount: { color: colors.text, fontSize: 12, fontWeight: '800' },
  limit: { color: colors.textSubtle, fontWeight: '600' },
  remaining: { marginTop: 7, color: colors.textMuted, fontSize: 11, fontWeight: '600' },
});
