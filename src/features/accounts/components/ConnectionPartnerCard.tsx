import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';
import { Pressable, Text, View } from 'react-native';
import { AppIcon } from '@/shared/components/atoms/icons/AppIcon';
import { colors } from '@/shared/constants/theme';
import type { ConnectionProvider } from '@/features/accounts/hooks/useAccountConnections';

type Props = {
  provider: ConnectionProvider;
  providerName: string;
  providerDetail: string;
  actionLabel: string;
  onPress: () => void;
  active?: boolean;
  compact?: boolean;
  statusLabel?: string;
  phoneLabel?: string;
};

export function ConnectionPartnerCard({
  provider,
  providerName,
  providerDetail,
  actionLabel,
  onPress,
  active = false,
  compact = false,
  statusLabel,
  phoneLabel,
}: Props) {
  if (compact) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={providerName}
        onPress={onPress}
        className="w-20 min-h-[88px] items-center justify-center p-2 rounded-[12px] bg-figmaSurfaceMuted"
      >
        <View
          className="w-[34px] h-[26px] items-center justify-center rounded-[8px]"
          style={{ backgroundColor: provider.logoBackground }}
        >
          <Text
            className="text-[10px] font-extrabold"
            style={{ color: provider.logoColor }}
          >
            {provider.logo}
          </Text>
        </View>
        <Text
          numberOfLines={2}
          className="mt-[5px] text-figmaText text-[10px] font-extrabold text-center"
        >
          {providerName}
        </Text>
        <Text className="mt-0.5 text-figmaTextMuted text-[9px] text-center">
          {statusLabel}
        </Text>
      </Pressable>
    );
  }

  return (
    <View
      className={cn(uiClasses.rowBetween, uiClasses.connectionCard, 'gap-sm')}
    >
      <View className="flex-1 flex-row items-center gap-sm">
        <View
          className="w-11 h-11 items-center justify-center rounded-[12px]"
          style={{ backgroundColor: provider.logoBackground }}
        >
          <Text
            className="text-[14px] font-extrabold text-center"
            style={{ color: provider.logoColor }}
          >
            {provider.logo}
          </Text>
        </View>
        <View className="flex-1 gap-0.5">
          <View className={cn(uiClasses.row, 'gap-1.5')}>
            <Text className="text-figmaText text-[14px] font-extrabold tracking-[0.14px]">
              {providerName}
            </Text>
            {active && (
              <AppIcon
                name="check-decagram-outline"
                size={15}
                color={colors.primaryGreen}
              />
            )}
          </View>
          {statusLabel && (
            <View className={cn(uiClasses.row, 'gap-1.5')}>
              <View
                className={cn(
                  'w-2 h-2 rounded-[4px]',
                  active ? 'bg-primaryGreen' : 'bg-textMuted',
                )}
              />
              <Text
                className={cn(
                  'text-figmaTextMuted text-[13px] leading-[18px]',
                  active && 'text-primaryGreen font-bold',
                )}
              >
                {statusLabel}
              </Text>
              {phoneLabel && (
                <Text className="text-figmaTextMuted text-[13px]">
                  • {phoneLabel}
                </Text>
              )}
            </View>
          )}
          {!statusLabel && (
            <Text className="text-figmaTextMuted text-[13px] leading-[18px]">
              {providerDetail}
            </Text>
          )}
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        onPress={onPress}
        className={cn(
          uiClasses.center,
          'min-h-11 px-4 py-2 rounded-[12px]',
          active ? 'bg-figmaSurfaceMuted' : 'bg-primaryDeep',
          'active:opacity-[0.7]',
        )}
      >
        <Text
          className={cn(
            'text-[12px] font-bold tracking-[0.24px]',
            active ? 'text-figmaTextSecondary' : 'text-white',
          )}
        >
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}
