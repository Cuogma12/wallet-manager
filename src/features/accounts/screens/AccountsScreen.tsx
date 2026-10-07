import { cn } from '@/shared/styles/cn';
import { uiClasses } from '@/shared/styles/classes';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ScreenContainer } from '@/shared/components/atoms/ScreenContainer';
import {
  AppIcon,
  type AppIconName,
} from '@/shared/components/atoms/icons/AppIcon';
import { IconButton } from '@/shared/components/atoms/IconButton';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { Badge } from '@/shared/components/atoms/Badge';
import { colors } from '@/shared/constants/theme';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { formatCurrency } from '@/shared/utils/format';
import { useI18n, type I18nKey } from '@/shared/i18n';

// Feature screen module.

export default function AccountsScreen() {
  const model = useAccounts();
  const { accounts, totalBalance } = model;
  const { t } = useI18n();
  return (
    <ScreenContainer>
      <ScrollView
        contentContainerClassName={cn(uiClasses.screenContent, 'pb-[110px]')}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-textMuted text-[10px] font-extrabold tracking-[1.1px]">
              {t('accounts.eyebrow')}
            </Text>
            <Text className="mt-1 text-text text-[28px] font-extrabold -tracking-[0.7px]">
              {t('accounts.title')}
            </Text>
          </View>
          <IconButton
            name="plus"
            accessibilityLabel={t('accounts.addWallet')}
            onPress={model.createAccount}
            disabled={model.isSaving}
          />
        </View>
        {model.loadError && (
          <View className="mt-md gap-sm">
            <Text className={uiClasses.error}>{t('common.loadFailed')}</Text>
            <AppButton label={t('common.retry')} onPress={model.refresh} />
          </View>
        )}
        <View className="mt-md gap-sm">
          <AppButton
            label={t('accounts.recordSalary')}
            onPress={model.openSalary}
            disabled={model.isSaving}
          />
        </View>
        {model.hasDemo && (
          <View className="mt-md gap-sm rounded-md bg-warningSoft p-md">
            <Text className="text-text font-bold">
              {t('accounts.demoTitle')}
            </Text>
            <Text className={uiClasses.hint}>
              {t('accounts.demoDescription')}
            </Text>
            <AppButton
              label={t(model.isSaving ? 'common.saving' : 'accounts.clearDemo')}
              onPress={model.confirmClearDemo}
              disabled={model.isSaving}
              variant="secondary"
            />
          </View>
        )}
        {model.error && (
          <Text
            accessibilityRole="alert"
            className={cn(uiClasses.error, 'mt-md')}
          >
            {model.error}
          </Text>
        )}
        <View className="mt-6 p-xl rounded-lg bg-primary">
          <Text className="text-[rgba(255,255,255,0.62)] text-[10px] font-extrabold tracking-[1px]">
            {t('accounts.totalAssets')}
          </Text>
          <Text className="mt-2.5 text-white text-[27px] font-extrabold">
            {formatCurrency(totalBalance)}
          </Text>
          <View className={cn(uiClasses.row, 'gap-1.5 mt-3.5')}>
            <View className="w-[7px] h-[7px] rounded-[4px] bg-[#8DE1B1]" />
            <Text className="text-[rgba(255,255,255,0.64)] text-[11px]">
              {t('accounts.manualData')}
            </Text>
          </View>
        </View>
        <View className="flex-row justify-between items-center mt-7 mb-3">
          <Text className="text-text text-[16px] font-extrabold">
            {t('nav.accounts')}
          </Text>
          <Text className="text-textMuted text-[12px] font-semibold">
            {t('accounts.sourceCount', { count: accounts.length })}
          </Text>
        </View>
        {accounts.length === 0 ? (
          <View className="gap-md rounded-md bg-surface p-lg">
            <Text className="text-text font-bold">
              {t('accounts.emptyTitle')}
            </Text>
            <Text className={uiClasses.hint}>{t('accounts.emptyText')}</Text>
            <AppButton
              label={t('accounts.addWallet')}
              onPress={model.createAccount}
            />
          </View>
        ) : (
          <Text className={cn(uiClasses.hint, 'mb-md')}>
            {t('accounts.balanceHint')}
          </Text>
        )}
        {accounts.map((account) => (
          <Pressable
            key={account.id}
            accessibilityRole="button"
            accessibilityLabel={t('accounts.editWallet', {
              name: account.name,
            })}
            disabled={model.isSaving}
            onPress={() => model.editAccount(account.id)}
            className={cn(uiClasses.row, 'mb-2.5 p-md rounded-md bg-surface')}
          >
            <View
              className="w-11 h-11 items-center justify-center rounded-[14px]"
              style={{ backgroundColor: `${account.color}1A` }}
            >
              <AppIcon
                name={account.icon as AppIconName}
                size={22}
                color={account.color}
              />
            </View>
            <View className="flex-1 ml-3">
              <View className={cn(uiClasses.row, 'gap-sm')}>
                <Text className="shrink text-text text-[14px] font-extrabold">
                  {account.name}
                </Text>
                {account.isDemo && (
                  <Badge label={t('accounts.demoBadge')} tone="warning" />
                )}
              </View>
              <Text className="mt-[3px] text-textMuted text-[11px]">
                {t(`accountTypes.${account.type}` as I18nKey)}
              </Text>
              <View className={cn(uiClasses.row, 'gap-[5px] mt-[5px]')}>
                <View
                  className={cn(
                    'w-1.5 h-1.5 rounded-[3px]',
                    account.syncStatus === 'needs-review'
                      ? 'bg-warning'
                      : 'bg-income',
                  )}
                />
                <Text className="text-textMuted text-[10px] font-semibold">
                  {t(
                    `accountStatus.${account.syncStatus === 'needs-review' ? 'needsReview' : account.syncStatus}` as I18nKey,
                  )}
                </Text>
              </View>
            </View>
            <Text className="text-text text-[12px] font-extrabold">
              {formatCurrency(account.balance)}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={model.openConnections}
          className={cn(
            uiClasses.row,
            'gap-3 mt-[18px] p-md border-[1px] border-primarySoft rounded-md bg-primarySoft',
          )}
        >
          <View className="w-10 h-10 items-center justify-center rounded-[13px] bg-white">
            <AppIcon name="link-variant" size={22} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-primary text-[14px] font-extrabold">
              {t('accounts.connectTitle')}
            </Text>
            <Text className="mt-[3px] text-primary opacity-[0.7] text-[11px] leading-[16px]">
              {t('accounts.connectText')}
            </Text>
          </View>
          <AppIcon name="chevron-right" size={22} color={colors.textMuted} />
        </Pressable>
        <Pressable
          onPress={model.openImport}
          className={cn(
            uiClasses.row,
            'justify-center gap-2 mt-3 py-3.5 rounded-[14px] bg-surface',
          )}
        >
          <AppIcon
            name="file-upload-outline"
            size={18}
            color={colors.primary}
          />
          <Text className="text-primary text-[13px] font-extrabold">
            {t('accounts.importStatement')}
          </Text>
        </Pressable>
        <View className="mt-xl gap-md rounded-md bg-expenseSoft p-md">
          <Text className="text-text font-bold">
            {t('accounts.resetWarning')}
          </Text>
          <Text className={uiClasses.hint}>
            {t('accounts.resetDescription')}
          </Text>
          <AppButton
            label={t(model.isSaving ? 'common.saving' : 'accounts.resetAll')}
            variant="danger"
            onPress={model.confirmResetFinance}
            disabled={model.isSaving}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
