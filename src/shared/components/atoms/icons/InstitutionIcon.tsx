import { Image, View } from 'react-native';
import { AppIcon } from '@/shared/components/atoms/icons/AppIcon';
import { institutionLogos } from '@/shared/components/atoms/icons/institutionLogos';
import { getAccountProvider } from '@/shared/constants/accountProviders';
import { accountTypes } from '@/shared/constants/accountTypes';
import type { AccountType } from '@/shared/types/finance';
import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';

export function InstitutionIcon({
  providerId,
  type,
}: {
  providerId?: string | null;
  type: AccountType;
}) {
  const provider = getAccountProvider(providerId);
  const source =
    provider?.type === type ? institutionLogos[provider.id] : undefined;
  const fallback =
    accountTypes.find((item) => item.type === type) ?? accountTypes[0];
  return (
    <View className={cn(uiClasses.institutionLogo, uiClasses.center)}>
      {source ? (
        <Image
          source={source}
          resizeMode="contain"
          className="!h-full !w-full"
          accessible={false}
        />
      ) : (
        <AppIcon name={fallback.icon} color={fallback.color} size={24} />
      )}
    </View>
  );
}
