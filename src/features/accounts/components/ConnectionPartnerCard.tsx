import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '@/shared/components/atoms/icons/AppIcon';
import { colors, spacing } from '@/shared/constants/theme';
import type { ConnectionProvider } from '@/features/accounts/hooks/useAccountConnections';

type Props = {
  provider: ConnectionProvider;
  providerName: string;
  providerDetail: string;
  actionLabel: string;
  onPress: () => void;
  active?: boolean;
  compact?: boolean;
  statusLabel?: string;
  phoneLabel?: string;
};

export function ConnectionPartnerCard({ provider, providerName, providerDetail, actionLabel, onPress, active = false, compact = false, statusLabel, phoneLabel }: Props) {
  if (compact) {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={providerName} onPress={onPress} style={styles.compactCard}>
        <View style={[styles.compactLogo, { backgroundColor: provider.logoBackground }]}>
          <Text style={[styles.compactLogoText, { color: provider.logoColor }]}>{provider.logo}</Text>
        </View>
        <Text numberOfLines={2} style={styles.compactName}>{providerName}</Text>
        <Text style={styles.compactDetail}>{statusLabel}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.providerInfo}>
        <View style={[styles.logo, { backgroundColor: provider.logoBackground }]}>
          <Text style={[styles.logoText, { color: provider.logoColor }]}>{provider.logo}</Text>
        </View>
        <View style={styles.details}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{providerName}</Text>
            {active && <AppIcon name="check-decagram-outline" size={15} color={colors.primaryGreen} />}
          </View>
          {statusLabel && (
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: active ? colors.primaryGreen : colors.textMuted }]} />
              <Text style={[styles.status, active && styles.activeStatus]}>{statusLabel}</Text>
              {phoneLabel && <Text style={styles.phone}>• {phoneLabel}</Text>}
            </View>
          )}
          {!statusLabel && <Text style={styles.detail}>{providerDetail}</Text>}
        </View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={actionLabel} onPress={onPress} style={({ pressed }) => [styles.action, active ? styles.actionMuted : styles.actionPrimary, pressed && styles.pressed]}>
        <Text style={[styles.actionText, active ? styles.actionTextMuted : styles.actionTextPrimary]}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: 12,
    borderRadius: 18,
    backgroundColor: colors.surface,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  providerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  logoText: { fontSize: 14, fontWeight: '800', textAlign: 'center' },
  details: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { color: colors.figmaText, fontSize: 14, fontWeight: '800', letterSpacing: 0.14 },
  detail: { color: colors.figmaTextMuted, fontSize: 13, lineHeight: 18 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  status: { color: colors.figmaTextMuted, fontSize: 13, lineHeight: 18 },
  activeStatus: { color: colors.primaryGreen, fontWeight: '700' },
  phone: { color: colors.figmaTextMuted, fontSize: 13 },
  action: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  actionPrimary: { backgroundColor: colors.primaryDeep },
  actionMuted: { backgroundColor: colors.figmaSurfaceMuted },
  actionText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.24 },
  actionTextPrimary: { color: colors.white },
  actionTextMuted: { color: colors.figmaTextSecondary },
  pressed: { opacity: 0.7 },
  compactCard: { width: 80, minHeight: 88, alignItems: 'center', justifyContent: 'center', padding: 8, borderRadius: 12, backgroundColor: colors.figmaSurfaceMuted },
  compactLogo: { width: 34, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  compactLogoText: { fontSize: 10, fontWeight: '800' },
  compactName: { marginTop: 5, color: colors.figmaText, fontSize: 10, fontWeight: '800', textAlign: 'center' },
  compactDetail: { marginTop: 2, color: colors.figmaTextMuted, fontSize: 9, textAlign: 'center' },
});
