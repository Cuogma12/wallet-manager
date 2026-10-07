import { StyleSheet, Text, View } from 'react-native';
import { AppIcon, type AppIconName } from '@/shared/components/atoms/icons/AppIcon';
import { Card } from '@/shared/components/atoms/Card';
import { colors, spacing } from '@/shared/constants/theme';

type Props = { label: string; value: string; icon: AppIconName; tone: 'income' | 'expense' };

export function StatCard({ label, value, icon, tone }: Props) {
  const isIncome = tone === 'income';
  return <Card style={styles.card}><View style={[styles.icon, { backgroundColor: isIncome ? colors.incomeSoft : colors.expenseSoft }]}><AppIcon name={icon} size={18} color={isIncome ? colors.income : colors.expense} /></View><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></Card>;
}

const styles = StyleSheet.create({
  card: { flex: 1, padding: spacing.md },
  icon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  value: { marginTop: 5, color: colors.text, fontSize: 14, fontWeight: '800' },
});
