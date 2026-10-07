import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ScreenContainer } from '@/shared/components/atoms/ScreenContainer';
import { AppIcon } from '@/shared/components/atoms/icons/AppIcon';
import { ProgressBar } from '@/shared/components/atoms/ProgressBar';
import { colors } from '@/shared/constants/theme';
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
      <View className="flex-1 bg-figmaBackground">
        <View className="h-16 flex-row items-center justify-between px-md bg-[rgba(248,250,246,0.95)] shadow-[0px_1px_8px_rgba(40,62,45,0.04)]">
          <View className={cn(uiClasses.row, 'gap-2 flex-1')}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('accountConnections.back')}
              onPress={goBack}
              className="w-11 h-11 items-center justify-center rounded-[22px]"
            >
              <AppIcon name="arrow-left" size={21} color={colors.figmaText} />
            </Pressable>
            <Text className="text-primaryGreen text-[14px] font-extrabold">
              Monee
            </Text>
            <Text className="text-figmaText text-[18px] font-bold -tracking-[0.18px]">
              {t('accountConnections.title')}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('accountConnections.support')}
            onPress={showHelp}
            className="w-8 h-8 items-center justify-center rounded-[16px] bg-primaryDeep"
          >
            <AppIcon
              name="help-circle-outline"
              size={16}
              color={colors.white}
            />
          </Pressable>
        </View>

        <ScrollView
          contentContainerClassName="gap-2 p-md pb-[34px]"
          showsVerticalScrollIndicator={false}
        >
          <View className={cn(uiClasses.rowBetween, 'pt-1 pb-2')}>
            <View className={cn(uiClasses.row, 'gap-1 flex-1')}>
              <View className="w-2 h-2 rounded-[4px] bg-successBright" />
              <Text className="text-primaryGreen text-[11px] font-bold tracking-[0.55px]">
                {t('accountConnections.secureLabel')}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('accountConnections.support')}
              onPress={showHelp}
              className={cn(
                uiClasses.row,
                'gap-1 px-2.5 py-1 rounded-pill bg-[#EDEEEB]',
              )}
            >
              <AppIcon
                name="lifebuoy"
                size={13}
                color={colors.figmaTextSecondary}
              />
              <Text className="text-figmaTextSecondary text-[11px] font-medium tracking-[0.33px]">
                {t('accountConnections.support')}
              </Text>
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

          <SectionHeading
            title={t('accountConnections.systemStatus')}
            trailing={t('accountConnections.realtime')}
          />
          <View className="gap-2">
            <View className="gap-2 p-3 rounded-[18px] bg-surface shadow-card">
              <View className={cn(uiClasses.row, 'gap-2')}>
                <ProviderLogo
                  label="VCB"
                  backgroundColor={colors.figmaSurfaceMuted}
                  color={colors.primaryGreen}
                />
                <View className="flex-1 gap-0.5">
                  <Text className="text-figmaText text-[14px] font-extrabold tracking-[0.14px]">
                    {t('accountConnections.providers.vietcombank.name')}
                  </Text>
                  <Text className="text-figmaTextSecondary text-[13px] leading-[18px]">
                    {t('accountConnections.providers.vietcombank.detail')}
                  </Text>
                </View>
                <View
                  className={cn(
                    uiClasses.row,
                    'gap-1.5 px-3 py-1 rounded-pill bg-successSoftStrong',
                  )}
                >
                  <AppIcon name="sync" size={14} color={colors.successText} />
                  <Text className="text-successText text-[11px] font-bold tracking-[0.33px]">
                    {t('accountConnections.syncing')}
                  </Text>
                </View>
              </View>
              <View
                className={cn(
                  uiClasses.rowBetween,
                  'px-3 py-2 rounded-[12px] bg-figmaSurfaceMuted',
                )}
              >
                <Text className="text-figmaTextSecondary text-[13px]">
                  {t('accountConnections.syncDetail')}
                </Text>
                <Text className="text-primaryGreen text-[11px] font-extrabold">
                  {t('accountConnections.syncProgress', { progress: 78 })}
                </Text>
              </View>
              <ProgressBar progress={0.78} color={colors.primaryGreen} />
            </View>

            {showSessionExpired && (
              <View className="gap-2.5 p-3 rounded-[18px] bg-errorSoft shadow-card">
                <View className="flex-row items-start gap-2">
                  <View className="w-10 h-10 items-center justify-center rounded-[12px] bg-error">
                    <AppIcon
                      name="alert-circle-outline"
                      size={20}
                      color={colors.white}
                    />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <View className={cn(uiClasses.rowBetween, 'gap-2')}>
                      <Text className="flex-1 text-errorText text-[14px] font-extrabold tracking-[0.14px]">
                        {t('accountConnections.sessionExpiredTitle')}
                      </Text>
                      <Text className="px-2 py-0.5 rounded-pill bg-error text-white text-[11px] font-bold">
                        {t('accountConnections.paused')}
                      </Text>
                    </View>
                    <Text className="text-errorText text-[13px] leading-[18px]">
                      {t('accountConnections.sessionExpiredDescription')}
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-end gap-2">
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleSkip}
                    className="px-3 py-1.5 rounded-[10px] bg-white"
                  >
                    <Text className="text-figmaTextSecondary text-[11px] font-semibold">
                      {t('accountConnections.skip')}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleRetry}
                    className={cn(
                      uiClasses.row,
                      'gap-1.5 px-3 py-1.5 rounded-[10px] bg-error',
                    )}
                  >
                    <AppIcon name="refresh" size={14} color={colors.white} />
                    <Text className="text-white text-[11px] font-bold">
                      {t('accountConnections.retryNow')}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          <SectionHeading
            icon="bank-outline"
            title={t('accountConnections.banksTitle')}
            trailing={t('accountConnections.bankCount')}
          />
          <View className="gap-2">
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
              onPress={() =>
                handleConnect(t('accountConnections.providers.mbbank.name'))
              }
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
            <View className="flex-row gap-2">
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

          <SectionHeading
            icon="wallet-outline"
            title={t('accountConnections.walletsTitle')}
            trailing={t('accountConnections.walletCount')}
          />
          <View className="gap-2">
            {walletProviders.map((provider) => {
              const isMomo = provider.id === 'momo';
              return (
                <ConnectionPartnerCard
                  key={provider.id}
                  provider={provider}
                  providerName={t(provider.nameKey)}
                  providerDetail={
                    isMomo
                      ? t('accountConnections.active')
                      : t(provider.detailKey)
                  }
                  active={isMomo}
                  statusLabel={
                    isMomo ? t('accountConnections.active') : undefined
                  }
                  phoneLabel={
                    isMomo ? t('accountConnections.connectedPhone') : undefined
                  }
                  actionLabel={
                    isMomo
                      ? t('accountConnections.manage')
                      : t('accountConnections.connect')
                  }
                  onPress={() =>
                    isMomo
                      ? handleManage(t(provider.nameKey))
                      : handleConnect(t(provider.nameKey))
                  }
                />
              );
            })}
          </View>

          <View
            className={cn(
              uiClasses.row,
              'gap-3 mt-2 p-md rounded-lg bg-[#EDEEEB]',
            )}
          >
            <View className="w-12 h-12 items-center justify-center rounded-[16px] bg-white shadow-card">
              <AppIcon
                name="shield-refresh-outline"
                size={24}
                color={colors.primaryGreen}
              />
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="text-figmaText text-[14px] font-extrabold tracking-[0.14px]">
                {t('accountConnections.withdrawTitle')}
              </Text>
              <Text className="text-figmaTextSecondary text-[13px] leading-[18px]">
                {t('accountConnections.withdrawDescription')}
              </Text>
            </View>
          </View>

          <View className="gap-2.5 pt-2">
            <Pressable
              accessibilityRole="button"
              onPress={searchBanks}
              className={cn(
                'h-[52px] flex-row items-center justify-center gap-2 rounded-[16px] bg-primaryDeep shadow-[0px_4px_6px_rgba(0,0,0,0.1)]',
                'active:opacity-[0.75]',
              )}
            >
              <AppIcon name="magnify" size={16} color={colors.white} />
              <Text className="text-white text-[14px] font-extrabold tracking-[0.24px]">
                {t('accountConnections.searchBanks')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={manualEntry}
              className={cn(
                'h-12 flex-row items-center justify-center gap-2 rounded-[16px] bg-[#EDEEEB]',
                'active:opacity-[0.75]',
              )}
            >
              <AppIcon
                name="pencil-outline"
                size={16}
                color={colors.figmaText}
              />
              <Text className="text-figmaText text-[14px] font-bold">
                {t('accountConnections.manualEntry')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

function ProviderLogo({
  label,
  backgroundColor,
  color,
}: {
  label: string;
  backgroundColor: string;
  color: string;
}) {
  return (
    <View
      className="w-11 h-11 items-center justify-center rounded-[12px]"
      style={{ backgroundColor }}
    >
      <Text
        className="text-[14px] font-extrabold text-center"
        style={{ color }}
      >
        {label}
      </Text>
    </View>
  );
}

function SectionHeading({
  icon,
  title,
  trailing,
}: {
  icon?: 'bank-outline' | 'wallet-outline';
  title: string;
  trailing: string;
}) {
  return (
    <View className={cn(uiClasses.rowBetween, 'pt-2 pb-0.5')}>
      <View className={cn(uiClasses.row, 'gap-2')}>
        {icon && <AppIcon name={icon} size={16} color={colors.figmaText} />}
        <Text className="text-figmaText text-[18px] font-extrabold -tracking-[0.45px]">
          {title}
        </Text>
      </View>
      <Text className="text-figmaTextMuted text-[11px] font-medium tracking-[0.33px]">
        {trailing}
      </Text>
    </View>
  );
}
