import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon, type AppIconName } from '@/shared/components/atoms/icons/AppIcon';
import { Badge } from '@/shared/components/atoms/Badge';
import { colors, radii, spacing } from '@/shared/constants/theme';
import { formatCurrency, formatDateLabel } from '@/shared/utils/format';
import type { Account, Transaction } from '@/shared/types/finance';
import { useI18n } from '@/shared/i18n';

type Props = {
  transaction: Transaction;
  account?: Account;
  onPress?: () => void;
};

export function TransactionRow({ transaction, account, onPress }: Props) {
  const { t, intlLocale } = useI18n();
  const isIncome = transaction.type === 'income';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.icon, { backgroundColor: isIncome ? colors.incomeSoft : colors.surfaceMuted }]}>
        <AppIcon name={transaction.categoryIcon as AppIconName} size={21} color={isIncome ? colors.income : colors.primary} />
      </View>
      <View style={styles.details}>
        <View style={styles.titleLine}>
          <Text numberOfLines={1} style={styles.title}>{transaction.title}</Text>
          {transaction.source !== 'manual' && <Badge label={t('common.automatic')} tone="warning" />}
        </View>
        <Text style={styles.meta}>{account?.name ?? t('add.account')} · {formatDateLabel(transaction.occurredAt, intlLocale)}</Text>
      </View>
      <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>{isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: spacing.md },
  pressed: { opacity: 0.65 },
  icon: { width: 44, height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  details: { flex: 1, gap: 4 },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  title: { flexShrink: 1, color: colors.text, fontSize: 15, fontWeight: '700' },
  meta: { color: colors.textMuted, fontSize: 12 },
  amount: { fontSize: 13, fontWeight: '800', textAlign: 'right' },
  income: { color: colors.income },
  expense: { color: colors.text },
});
