import { Text, View } from 'react-native';
import { AppIcon } from '@/shared/components/atoms/icons/AppIcon';
import { colors } from '@/shared/constants/theme';

type Props = {
  title: string;
  safeBadge: string;
  description: string;
  bullets: string[];
};

export function SecurityGuaranteeCard({
  title,
  safeBadge,
  description,
  bullets,
}: Props) {
  return (
    <View className="relative overflow-hidden gap-sm p-md rounded-lg bg-successSoft shadow-card">
      <View className="absolute -right-6 -bottom-6 w-24 h-24 rounded-[48px] bg-successSoftStrong" />
      <View className="flex-row items-start gap-sm">
        <View className="w-10 h-10 items-center justify-center rounded-sm bg-primaryGreen">
          <AppIcon name="shield-check-outline" size={20} color={colors.white} />
        </View>
        <View className="flex-1 gap-1.5">
          <Text className="text-primaryDeep text-[14px] font-extrabold tracking-[0.14px]">
            {title}
          </Text>
          <Text className="self-start px-2 py-0.5 rounded-pill bg-primaryGreen text-white text-[11px] font-bold tracking-[0.33px]">
            {safeBadge}
          </Text>
          <Text className="text-figmaTextSecondary text-[13px] leading-[21px]">
            {description}
          </Text>
        </View>
      </View>
      <View className="gap-2 pt-2">
        {bullets.map((bullet) => (
          <View key={bullet} className="flex-row items-start gap-2">
            <AppIcon
              name="check-circle-outline"
              size={15}
              color={colors.primaryGreen}
            />
            <Text className="flex-1 text-figmaText text-[13px] leading-[18px] font-medium">
              {bullet}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
