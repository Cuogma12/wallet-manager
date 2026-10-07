import { View, type StyleProp, type ViewStyle } from 'react-native';
import { cn } from '@/shared/styles/cn';
import { uiClasses } from '@/shared/styles/classes';

export function Card({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View className={cn(uiClasses.card, className)} style={style}>
      {children}
    </View>
  );
}
