import { Pressable, Text, View } from 'react-native';
import { InstitutionIcon } from '@/shared/components/atoms/icons/InstitutionIcon';
import { AppIcon } from '@/shared/components/atoms/icons/AppIcon';
import { colors } from '@/shared/constants/theme';
import type { AccountProvider } from '@/shared/constants/accountProviders';
import { uiClasses } from '@/shared/styles/classes';

export function ConnectionPartnerCard({
  provider,
  actionLabel,
  onPress,
}: {
  provider: AccountProvider;
  actionLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={actionLabel}
      onPress={onPress}
      className={uiClasses.choiceRow}
    >
      <InstitutionIcon providerId={provider.id} type={provider.type} />
      <View className="flex-1 gap-1">
        <Text className="text-text font-bold">{provider.name}</Text>
        <Text className={uiClasses.hint}>{provider.fullName}</Text>
      </View>
      <AppIcon name="plus" color={colors.primary} />
    </Pressable>
  );
}
