import { StyleSheet, Text } from 'react-native';
import { colors, radii } from '@/shared/constants/theme';

type Props = {
  label: string;
  tone?: 'warning' | 'success' | 'neutral';
};

export function Badge({ label, tone = 'neutral' }: Props) {
  return <Text style={[styles.badge, tone === 'warning' ? styles.warning : tone === 'success' ? styles.success : styles.neutral]}>{label}</Text>;
}

const styles = StyleSheet.create({
  badge: { borderRadius: radii.pill, paddingHorizontal: 6, paddingVertical: 2, fontSize: 9, fontWeight: '700' },
  warning: { color: colors.warning, backgroundColor: colors.warningSoft },
  success: { color: colors.income, backgroundColor: colors.incomeSoft },
  neutral: { color: colors.textMuted, backgroundColor: colors.surfaceMuted },
});
