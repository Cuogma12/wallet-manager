import { Text, View } from 'react-native';
import { FormScreen } from '@/shared/components/organisms/FormScreen';
import { FormField } from '@/shared/components/molecules/FormField';
import { AccountTypePicker } from '@/shared/components/molecules/AccountTypePicker';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { ConnectionPartnerCard } from '@/features/accounts/components/ConnectionPartnerCard';
import { useAccountConnections } from '@/features/accounts/hooks/useAccountConnections';
import { useI18n } from '@/shared/i18n';
import { uiClasses } from '@/shared/styles/classes';

export default function ConnectAccountsScreen() {
  const model = useAccountConnections();
  const { t } = useI18n();
  return (
    <FormScreen title={t('accountProviders.title')} onClose={model.goBack}>
      <View className="gap-sm rounded-md bg-primarySoft p-md">
        <Text className="font-bold text-primary">
          {t('accountProviders.localTitle')}
        </Text>
        <Text className={uiClasses.hint}>
          {t('accountProviders.manualHint')}
        </Text>
      </View>
      <AccountTypePicker
        value={model.type}
        onChange={model.changeType}
        includeCash={false}
      />
      <FormField
        label={t('accountProviders.search')}
        placeholder={t('accountProviders.searchPlaceholder')}
        value={model.query}
        onChangeText={model.setQuery}
        autoCorrect={false}
        maxLength={100}
      />
      <View className="gap-sm">
        <Text className={uiClasses.hint}>
          {t('accountProviders.count', { count: model.providers.length })}
        </Text>
        {model.providers.map((provider) => (
          <ConnectionPartnerCard
            key={provider.id}
            provider={provider}
            actionLabel={t('accountProviders.add', { name: provider.name })}
            onPress={() => model.createAccount(provider.id)}
          />
        ))}
        {model.providers.length === 0 && (
          <Text className={uiClasses.hint}>{t('accountProviders.empty')}</Text>
        )}
      </View>
      <AppButton
        label={t('accountProviders.createOther')}
        variant="secondary"
        onPress={model.manualEntry}
      />
    </FormScreen>
  );
}
