import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/shared/components/atoms/ScreenContainer';
import { AppIcon, type AppIconName } from '@/shared/components/atoms/icons/AppIcon';
import { IconButton } from '@/shared/components/atoms/IconButton';
import { colors, radii, spacing } from '@/shared/constants/theme';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/shared/utils/format';
import { useI18n, type I18nKey } from '@/shared/i18n';

// Feature screen module.

export default function AccountsScreen() {
  const { accounts } = useFinance();
  const { t } = useI18n();
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><View><Text style={styles.eyebrow}>{t('accounts.eyebrow')}</Text><Text style={styles.title}>{t('accounts.title')}</Text></View><IconButton name="cog-outline" accessibilityLabel={t('accounts.settings')} onPress={() => Alert.alert(t('accounts.comingSoon'), t('accounts.settingsComingSoon'))} /></View>
        <View style={styles.totalCard}><Text style={styles.totalLabel}>{t('accounts.totalAssets')}</Text><Text style={styles.totalValue}>{formatCurrency(totalBalance)}</Text><View style={styles.syncRow}><View style={styles.greenDot} /><Text style={styles.syncText}>{t('accounts.manualData')}</Text></View></View>
        <View style={styles.sectionRow}><Text style={styles.sectionTitle}>{t('nav.accounts')}</Text><Text style={styles.count}>{t('accounts.sourceCount', { count: accounts.length })}</Text></View>
        {accounts.map((account) => <View key={account.id} style={styles.accountCard}><View style={[styles.accountIcon, { backgroundColor: `${account.color}1A` }]}><AppIcon name={account.icon as AppIconName} size={22} color={account.color} /></View><View style={styles.accountInfo}><Text style={styles.accountName}>{account.name}</Text><Text style={styles.accountType}>{t(`accountTypes.${account.type}` as I18nKey)}</Text><View style={styles.statusRow}><View style={[styles.statusDot, { backgroundColor: account.syncStatus === 'needs-review' ? colors.warning : colors.income }]} /><Text style={styles.statusText}>{t(`accountStatus.${account.syncStatus === 'needs-review' ? 'needsReview' : account.syncStatus}` as I18nKey)}</Text></View></View><Text style={styles.accountBalance}>{formatCurrency(account.balance)}</Text></View>)}
        <Pressable onPress={() => Alert.alert(t('accounts.connectTitle'), t('accounts.openBankingComingSoon'))} style={styles.connectCard}><View style={styles.connectIcon}><AppIcon name="link-variant" size={22} color={colors.primary} /></View><View style={styles.connectBody}><Text style={styles.connectTitle}>{t('accounts.connectTitle')}</Text><Text style={styles.connectText}>{t('accounts.connectText')}</Text></View><AppIcon name="chevron-right" size={22} color={colors.textMuted} /></Pressable>
        <Pressable onPress={() => Alert.alert(t('accounts.importStatement'), t('accounts.importComingSoon'))} style={styles.importButton}><AppIcon name="file-upload-outline" size={18} color={colors.primary} /><Text style={styles.importText}>{t('accounts.importStatement')}</Text></Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: 110 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  title: { marginTop: 4, color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.7 },
  totalCard: { marginTop: 24, padding: spacing.xl, borderRadius: radii.lg, backgroundColor: colors.primary },
  totalLabel: { color: 'rgba(255,255,255,0.62)', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  totalValue: { marginTop: 10, color: colors.white, fontSize: 27, fontWeight: '800' },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  greenDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#8DE1B1' },
  syncText: { color: 'rgba(255,255,255,0.64)', fontSize: 11 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 12 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  count: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  accountCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.surface },
  accountIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  accountInfo: { flex: 1, marginLeft: 12 },
  accountName: { color: colors.text, fontSize: 14, fontWeight: '800' },
  accountType: { marginTop: 3, color: colors.textMuted, fontSize: 11 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { color: colors.textMuted, fontSize: 10, fontWeight: '600' },
  accountBalance: { color: colors.text, fontSize: 12, fontWeight: '800' },
  connectCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18, padding: spacing.md, borderWidth: 1, borderColor: colors.primarySoft, borderRadius: radii.md, backgroundColor: colors.primarySoft },
  connectIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: colors.white },
  connectBody: { flex: 1 },
  connectTitle: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  connectText: { marginTop: 3, color: colors.primary, opacity: 0.7, fontSize: 11, lineHeight: 16 },
  importButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12, paddingVertical: 14, borderRadius: 14, backgroundColor: colors.surface },
  importText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
});
