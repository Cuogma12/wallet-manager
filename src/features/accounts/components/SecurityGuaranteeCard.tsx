import { StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '@/shared/components/atoms/icons/AppIcon';
import { colors, radii, spacing } from '@/shared/constants/theme';

type Props = {
  title: string;
  safeBadge: string;
  description: string;
  bullets: string[];
};

export function SecurityGuaranteeCard({ title, safeBadge, description, bullets }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.glow} />
      <View style={styles.headingRow}>
        <View style={styles.iconBox}>
          <AppIcon name="shield-check-outline" size={20} color={colors.white} />
        </View>
        <View style={styles.headingBody}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.badge}>{safeBadge}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>
      <View style={styles.bullets}>
        {bullets.map((bullet) => (
          <View key={bullet} style={styles.bulletRow}>
            <AppIcon name="check-circle-outline" size={15} color={colors.primaryGreen} />
            <Text style={styles.bullet}>{bullet}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.successSoft,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  glow: {
    position: 'absolute',
    right: -24,
    bottom: -24,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.successSoftStrong,
  },
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  iconBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.primaryGreen,
  },
  headingBody: { flex: 1, gap: 6 },
  title: { color: colors.primaryDeep, fontSize: 14, fontWeight: '800', letterSpacing: 0.14 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryGreen,
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.33,
  },
  description: { color: colors.figmaTextSecondary, fontSize: 13, lineHeight: 21 },
  bullets: { gap: 8, paddingTop: 8 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bullet: { flex: 1, color: colors.figmaText, fontSize: 13, lineHeight: 18, fontWeight: '500' },
});
