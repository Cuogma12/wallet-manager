import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/shared/components/atoms/ScreenContainer';
import { AppIcon } from '@/shared/components/atoms/icons/AppIcon';
import { ProgressBar } from '@/shared/components/atoms/ProgressBar';
import { colors, radii, spacing } from '@/shared/constants/theme';
import { useI18n } from '@/shared/i18n';
import { ConnectionPartnerCard } from '@/features/accounts/components/ConnectionPartnerCard';
import { SecurityGuaranteeCard } from '@/features/accounts/components/SecurityGuaranteeCard';
import {
  bankProviders,
  miniBankProviders,
  useAccountConnections,
  walletProviders,
} from '@/features/accounts/hooks/useAccountConnections';

// Feature screen module.

export default function ConnectAccountsScreen() {
  const { t } = useI18n();
  const {
    goBack,
    showHelp,
    handleConnect,
    handleManage,
    handleRetry,
    handleSkip,
    showSessionExpired,
    searchBanks,
    manualEntry,
  } = useAccountConnections();

  return (
    <ScreenContainer>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable accessibilityRole="button" accessibilityLabel={t('accountConnections.back')} onPress={goBack} style={styles.backButton}>
              <AppIcon name="arrow-left" size={21} color={colors.figmaText} />
            </Pressable>
            <Text style={styles.logo}>Monee</Text>
            <Text style={styles.headerTitle}>{t('accountConnections.title')}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={t('accountConnections.support')} onPress={showHelp} style={styles.helpButton}>
            <AppIcon name="help-circle-outline" size={16} color={colors.white} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topContext}>
            <View style={styles.secureLabelRow}>
              <View style={styles.secureDot} />
              <Text style={styles.secureLabel}>{t('accountConnections.secureLabel')}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={t('accountConnections.support')} onPress={showHelp} style={styles.supportPill}>
              <AppIcon name="lifebuoy" size={13} color={colors.figmaTextSecondary} />
              <Text style={styles.supportText}>{t('accountConnections.support')}</Text>
            </Pressable>
          </View>

          <SecurityGuaranteeCard
            title={t('accountConnections.securityTitle')}
            safeBadge={t('accountConnections.safeBadge')}
            description={t('accountConnections.securityDescription')}
            bullets={[
              t('accountConnections.noTransfer'),
              t('accountConnections.noPassword'),
              t('accountConnections.noOtp'),
            ]}
          />

          <SectionHeading title={t('accountConnections.systemStatus')} trailing={t('accountConnections.realtime')} />
          <View style={styles.stack}>
            <View style={styles.syncCard}>
              <View style={styles.providerRow}>
                <ProviderLogo label="VCB" backgroundColor={colors.figmaSurfaceMuted} color={colors.primaryGreen} />
                <View style={styles.providerBody}>
                  <Text style={styles.providerName}>{t('accountConnections.providers.vietcombank.name')}</Text>
                  <Text style={styles.providerDetail}>{t('accountConnections.providers.vietcombank.detail')}</Text>
                </View>
                <View style={styles.syncPill}>
                  <AppIcon name="sync" size={14} color={colors.successText} />
                  <Text style={styles.syncPillText}>{t('accountConnections.syncing')}</Text>
                </View>
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>{t('accountConnections.syncDetail')}</Text>
                <Text style={styles.progressValue}>{t('accountConnections.syncProgress', { progress: 78 })}</Text>
              </View>
              <ProgressBar progress={0.78} color={colors.primaryGreen} />
            </View>

            {showSessionExpired && <View style={styles.errorCard}>
              <View style={styles.errorHeadingRow}>
                <View style={styles.errorIconBox}>
                  <AppIcon name="alert-circle-outline" size={20} color={colors.white} />
                </View>
                <View style={styles.errorBody}>
                  <View style={styles.errorTitleRow}>
                    <Text style={styles.errorTitle}>{t('accountConnections.sessionExpiredTitle')}</Text>
                    <Text style={styles.pausedBadge}>{t('accountConnections.paused')}</Text>
                  </View>
                  <Text style={styles.errorDescription}>{t('accountConnections.sessionExpiredDescription')}</Text>
                </View>
              </View>
              <View style={styles.errorActions}>
                <Pressable accessibilityRole="button" onPress={handleSkip} style={styles.skipButton}>
                  <Text style={styles.skipText}>{t('accountConnections.skip')}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={handleRetry} style={styles.retryButton}>
                  <AppIcon name="refresh" size={14} color={colors.white} />
                  <Text style={styles.retryText}>{t('accountConnections.retryNow')}</Text>
                </Pressable>
              </View>
            </View>}
          </View>

          <SectionHeading icon="bank-outline" title={t('accountConnections.banksTitle')} trailing={t('accountConnections.bankCount')} />
          <View style={styles.stack}>
            <ConnectionPartnerCard
              provider={{
                id: 'mbbank',
                logo: 'MB',
                logoBackground: colors.primaryDeep,
                logoColor: colors.white,
                nameKey: 'accountConnections.providers.mbbank.name',
                detailKey: 'accountConnections.providers.mbbank.detail',
              }}
              providerName={t('accountConnections.providers.mbbank.name')}
              providerDetail={t('accountConnections.providers.mbbank.detail')}
              statusLabel={t('accountConnections.providers.mbbank.detail')}
              actionLabel={t('accountConnections.connect')}
              onPress={() => handleConnect(t('accountConnections.providers.mbbank.name'))}
            />
            {bankProviders.map((provider) => (
              <ConnectionPartnerCard
                key={provider.id}
                provider={provider}
                providerName={t(provider.nameKey)}
                providerDetail={t(provider.detailKey)}
                actionLabel={t('accountConnections.connect')}
                onPress={() => handleConnect(t(provider.nameKey))}
              />
            ))}
            <View style={styles.miniProviderRow}>
              {miniBankProviders.map((provider) => (
                <ConnectionPartnerCard
                  key={provider.id}
                  provider={provider}
                  providerName={t(provider.nameKey)}
                  providerDetail={t(provider.detailKey)}
                  statusLabel={t(provider.detailKey)}
                  actionLabel={t('accountConnections.connect')}
                  compact
                  onPress={() => handleConnect(t(provider.nameKey))}
                />
              ))}
            </View>
          </View>

          <SectionHeading icon="wallet-outline" title={t('accountConnections.walletsTitle')} trailing={t('accountConnections.walletCount')} />
          <View style={styles.stack}>
            {walletProviders.map((provider) => {
              const isMomo = provider.id === 'momo';
              return (
                <ConnectionPartnerCard
                  key={provider.id}
                  provider={provider}
                  providerName={t(provider.nameKey)}
                  providerDetail={isMomo ? t('accountConnections.active') : t(provider.detailKey)}
                  active={isMomo}
                  statusLabel={isMomo ? t('accountConnections.active') : undefined}
                  phoneLabel={isMomo ? t('accountConnections.connectedPhone') : undefined}
                  actionLabel={isMomo ? t('accountConnections.manage') : t('accountConnections.connect')}
                  onPress={() => (isMomo ? handleManage(t(provider.nameKey)) : handleConnect(t(provider.nameKey)))}
                />
              );
            })}
          </View>

          <View style={styles.reassuranceCard}>
            <View style={styles.reassuranceIcon}>
              <AppIcon name="shield-refresh-outline" size={24} color={colors.primaryGreen} />
            </View>
            <View style={styles.reassuranceBody}>
              <Text style={styles.reassuranceTitle}>{t('accountConnections.withdrawTitle')}</Text>
              <Text style={styles.reassuranceText}>{t('accountConnections.withdrawDescription')}</Text>
            </View>
          </View>

          <View style={styles.ctaStack}>
            <Pressable accessibilityRole="button" onPress={searchBanks} style={({ pressed }) => [styles.primaryCta, pressed && styles.pressed]}>
              <AppIcon name="magnify" size={16} color={colors.white} />
              <Text style={styles.primaryCtaText}>{t('accountConnections.searchBanks')}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={manualEntry} style={({ pressed }) => [styles.secondaryCta, pressed && styles.pressed]}>
              <AppIcon name="pencil-outline" size={16} color={colors.figmaText} />
              <Text style={styles.secondaryCtaText}>{t('accountConnections.manualEntry')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

function ProviderLogo({ label, backgroundColor, color }: { label: string; backgroundColor: string; color: string }) {
  return (
    <View style={[styles.providerLogo, { backgroundColor }]}>
      <Text style={[styles.providerLogoText, { color }]}>{label}</Text>
    </View>
  );
}

function SectionHeading({ icon, title, trailing }: { icon?: 'bank-outline' | 'wallet-outline'; title: string; trailing: string }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionTitleRow}>
        {icon && <AppIcon name={icon} size={16} color={colors.figmaText} />}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionTrailing}>{trailing}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.figmaBackground },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(248,250,246,0.95)',
    shadowColor: '#283E2D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  logo: { color: colors.primaryGreen, fontSize: 14, fontWeight: '800' },
  headerTitle: { color: colors.figmaText, fontSize: 18, fontWeight: '700', letterSpacing: -0.18 },
  helpButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.primaryDeep },
  content: { gap: 8, padding: spacing.md, paddingBottom: 34 },
  topContext: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, paddingBottom: 8 },
  secureLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  secureDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.successBright },
  secureLabel: { color: colors.primaryGreen, fontSize: 11, fontWeight: '700', letterSpacing: 0.55 },
  supportPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill, backgroundColor: '#EDEEEB' },
  supportText: { color: colors.figmaTextSecondary, fontSize: 11, fontWeight: '500', letterSpacing: 0.33 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 2 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: colors.figmaText, fontSize: 18, fontWeight: '800', letterSpacing: -0.45 },
  sectionTrailing: { color: colors.figmaTextMuted, fontSize: 11, fontWeight: '500', letterSpacing: 0.33 },
  stack: { gap: 8 },
  syncCard: { gap: 8, padding: 12, borderRadius: 18, backgroundColor: colors.surface, shadowColor: colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  providerLogo: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  providerLogoText: { fontSize: 14, fontWeight: '800', textAlign: 'center' },
  providerBody: { flex: 1, gap: 2 },
  providerName: { color: colors.figmaText, fontSize: 14, fontWeight: '800', letterSpacing: 0.14 },
  providerDetail: { color: colors.figmaTextSecondary, fontSize: 13, lineHeight: 18 },
  syncPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radii.pill, backgroundColor: colors.successSoftStrong },
  syncPillText: { color: colors.successText, fontSize: 11, fontWeight: '700', letterSpacing: 0.33 },
  progressInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: colors.figmaSurfaceMuted },
  progressLabel: { color: colors.figmaTextSecondary, fontSize: 13 },
  progressValue: { color: colors.primaryGreen, fontSize: 11, fontWeight: '800' },
  errorCard: { gap: 10, padding: 12, borderRadius: 18, backgroundColor: colors.errorSoft, shadowColor: colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  errorHeadingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  errorIconBox: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.error },
  errorBody: { flex: 1, gap: 2 },
  errorTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  errorTitle: { flex: 1, color: colors.errorText, fontSize: 14, fontWeight: '800', letterSpacing: 0.14 },
  pausedBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.pill, backgroundColor: colors.error, color: colors.white, fontSize: 11, fontWeight: '700' },
  errorDescription: { color: colors.errorText, fontSize: 13, lineHeight: 18 },
  errorActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  skipButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: colors.white },
  skipText: { color: colors.figmaTextSecondary, fontSize: 11, fontWeight: '600' },
  retryButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: colors.error },
  retryText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  miniProviderRow: { flexDirection: 'row', gap: 8 },
  reassuranceCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, padding: spacing.md, borderRadius: radii.lg, backgroundColor: '#EDEEEB' },
  reassuranceIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.white, shadowColor: colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  reassuranceBody: { flex: 1, gap: 2 },
  reassuranceTitle: { color: colors.figmaText, fontSize: 14, fontWeight: '800', letterSpacing: 0.14 },
  reassuranceText: { color: colors.figmaTextSecondary, fontSize: 13, lineHeight: 18 },
  ctaStack: { gap: 10, paddingTop: 8 },
  primaryCta: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, backgroundColor: colors.primaryDeep, shadowColor: colors.black, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  primaryCtaText: { color: colors.white, fontSize: 14, fontWeight: '800', letterSpacing: 0.24 },
  secondaryCta: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, backgroundColor: '#EDEEEB' },
  secondaryCtaText: { color: colors.figmaText, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.75 },
});
