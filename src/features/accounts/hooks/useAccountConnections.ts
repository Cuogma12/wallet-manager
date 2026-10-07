import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useI18n, type I18nKey } from '@/shared/i18n';

export type ConnectionProvider = {
  id: string;
  logo: string;
  logoBackground: string;
  logoColor: string;
  nameKey: I18nKey;
  detailKey: I18nKey;
};

export const bankProviders: ConnectionProvider[] = [
  {
    id: 'techcombank',
    logo: 'TCB',
    logoBackground: '#F7D8CD',
    logoColor: '#7E2A12',
    nameKey: 'accountConnections.providers.techcombank.name',
    detailKey: 'accountConnections.providers.techcombank.detail',
  },
  {
    id: 'acb',
    logo: 'ACB',
    logoBackground: '#E7E9E5',
    logoColor: '#4E6358',
    nameKey: 'accountConnections.providers.acb.name',
    detailKey: 'accountConnections.providers.acb.detail',
  },
];

export const miniBankProviders: ConnectionProvider[] = [
  {
    id: 'vpbank',
    logo: 'VPB',
    logoBackground: '#E5F7E8',
    logoColor: '#07803A',
    nameKey: 'accountConnections.providers.vpbank.name',
    detailKey: 'accountConnections.providers.vpbank.detail',
  },
  {
    id: 'tpbank',
    logo: 'TPB',
    logoBackground: '#E7E9E5',
    logoColor: '#4E6358',
    nameKey: 'accountConnections.providers.tpbank.name',
    detailKey: 'accountConnections.providers.tpbank.detail',
  },
];

export const walletProviders: ConnectionProvider[] = [
  {
    id: 'momo',
    logo: 'MoMo',
    logoBackground: '#451300',
    logoColor: '#FFFFFF',
    nameKey: 'accountConnections.providers.momo.name',
    detailKey: 'accountConnections.providers.momo.name',
  },
  {
    id: 'zalopay',
    logo: 'Zalo',
    logoBackground: '#E7E9E5',
    logoColor: '#122819',
    nameKey: 'accountConnections.providers.zalopay.name',
    detailKey: 'accountConnections.providers.zalopay.detail',
  },
  {
    id: 'shopeepay',
    logo: 'SPay',
    logoBackground: '#E7E9E5',
    logoColor: '#692100',
    nameKey: 'accountConnections.providers.shopeepay.name',
    detailKey: 'accountConnections.providers.shopeepay.detail',
  },
];

export function useAccountConnections() {
  const { t } = useI18n();
  const [showSessionExpired, setShowSessionExpired] = useState(true);

  const goBack = useCallback(() => router.back(), []);
  const showHelp = useCallback(() => {
    Alert.alert(t('accountConnections.helpTitle'), t('accountConnections.helpDescription'));
  }, [t]);
  const handleConnect = useCallback((provider: string) => {
    Alert.alert(
      t('accountConnections.connectedAlertTitle'),
      t('accountConnections.connectedAlertDescription', { provider }),
    );
  }, [t]);
  const handleManage = useCallback((provider: string) => {
    Alert.alert(
      t('accountConnections.connectedAlertTitle'),
      t('accountConnections.connectedAlertDescription', { provider }),
    );
  }, [t]);
  const handleRetry = useCallback(() => {
    setShowSessionExpired(true);
    Alert.alert(t('accountConnections.retryNow'), t('accountConnections.retryAlertDescription'));
  }, [t]);
  const handleSkip = useCallback(() => setShowSessionExpired(false), []);
  const searchBanks = useCallback(() => {
    Alert.alert(t('accountConnections.searchBanks'), t('accountConnections.searchAlertDescription'));
  }, [t]);
  const manualEntry = useCallback(() => router.push('/add'), []);

  return {
    goBack,
    showHelp,
    handleConnect,
    handleManage,
    handleRetry,
    handleSkip,
    showSessionExpired,
    searchBanks,
    manualEntry,
  };
}
