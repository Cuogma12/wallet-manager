import { Switch, Text, View } from 'react-native';
import { useAppSettings } from '@/features/app-settings/hooks/useAppSettings';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { FormScreen } from '@/shared/components/organisms/FormScreen';
import { useI18n } from '@/shared/i18n';
import { uiClasses } from '@/shared/styles/classes';

export default function AppSettingsScreen() {
  const model = useAppSettings();
  const { t } = useI18n();
  return (
    <FormScreen
      title={t('backup.title')}
      onClose={model.close}
      isSaving={model.isSaving}
    >
      {model.pwa.status !== 'native' && (
        <View className="gap-md rounded-md bg-surface p-lg">
          <Text accessibilityRole="header" className={uiClasses.fieldLabel}>
            {t('pwa.title')}
          </Text>
          <Text className={uiClasses.hint}>
            {t(`pwa.status.${model.pwa.status}`)}
          </Text>
          <Text className={uiClasses.hint}>{t('pwa.installHelp')}</Text>
          <Text className={uiClasses.hint}>
            {t(model.pwa.persisted ? 'pwa.persisted' : 'pwa.notPersisted')}
          </Text>
          <AppButton
            variant="secondary"
            label={t('pwa.keepStorage')}
            onPress={model.requestPersistence}
            disabled={model.isSaving}
          />
          {model.pwa.updateAvailable && (
            <>
              <Text className={uiClasses.hint}>{t('pwa.updateHint')}</Text>
              <AppButton
                label={t('pwa.update')}
                onPress={model.pwa.applyUpdate}
                disabled={model.isSaving || !!model.pending}
              />
            </>
          )}
        </View>
      )}
      <Text className={uiClasses.hint}>{t('backup.warning')}</Text>
      <AppButton
        label={t(model.isSaving ? 'common.saving' : 'backup.export')}
        onPress={model.exportFile}
        disabled={model.isSaving}
      />
      <AppButton
        label={t('backup.import')}
        onPress={model.chooseFile}
        variant="secondary"
        disabled={model.isSaving}
      />
      {!!model.notice && (
        <Text accessibilityLiveRegion="polite" className={uiClasses.hint}>
          {model.notice}
        </Text>
      )}
      {model.pending && (
        <View className="gap-md rounded-md bg-warningSoft p-lg">
          <Text accessibilityRole="header" className={uiClasses.fieldLabel}>
            {t('backup.confirmTitle')}
          </Text>
          <Text className={uiClasses.hint}>
            {t('backup.summary', {
              date: model.backupDate,
              accounts: model.pending.accounts.length,
              transactions: model.pending.transactions.length,
            })}
          </Text>
          <Text className={uiClasses.hint}>{t('backup.replaceWarning')}</Text>
          <View className={uiClasses.rowBetween}>
            <Text className="flex-1 pr-sm text-sm text-text">
              {t('backup.acknowledge')}
            </Text>
            <View className="min-h-11 justify-center">
              <Switch
                hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }}
                accessibilityLabel={t('backup.acknowledge')}
                value={model.acknowledged}
                onValueChange={model.setAcknowledged}
                disabled={model.isSaving}
              />
            </View>
          </View>
          <AppButton
            variant="danger"
            label={t('backup.confirmReplace')}
            onPress={model.confirmRestore}
            disabled={model.isSaving || !model.acknowledged}
          />
          <AppButton
            variant="secondary"
            label={t('common.cancel')}
            onPress={model.cancelRestore}
            disabled={model.isSaving}
          />
        </View>
      )}
      {!!model.error && (
        <Text accessibilityRole="alert" className={uiClasses.error}>
          {model.error}
        </Text>
      )}
      {model.loadError && (
        <>
          <Text className={uiClasses.error}>{t('common.loadFailed')}</Text>
          <AppButton label={t('common.retry')} onPress={model.refresh} />
        </>
      )}
    </FormScreen>
  );
}
