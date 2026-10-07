import { cn } from '@/shared/styles/cn';
import { uiClasses } from '@/shared/styles/classes';
import { Pressable, Text, View } from 'react-native';

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: Props) {
  return (
    <View className={cn(uiClasses.rowBetween, 'mt-8 mb-4')}>
      <Text className="text-text text-[16px] font-extrabold">{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction}>
          <Text className="text-primary text-[12px] font-extrabold">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
