import { Text, View } from 'react-native';
import { usePwa } from '@/context/PwaContext';
import { useI18n } from '@/shared/i18n';

export function OfflineBanner() {
  const pwa = usePwa();
  const { t } = useI18n();
  if (pwa.status === 'native' || pwa.status === 'ready') return null;
  return (
    <View className="bg-warningSoft px-md py-sm">
      <Text accessibilityLiveRegion="polite" className="text-xs text-text">
        {t(`pwa.status.${pwa.status}`)}
      </Text>
    </View>
  );
}
