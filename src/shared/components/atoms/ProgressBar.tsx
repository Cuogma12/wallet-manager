import { View } from 'react-native';
import { colors } from '@/shared/constants/theme';

export function ProgressBar({
  progress,
  color = colors.expense,
}: {
  progress: number;
  color?: string;
}) {
  return (
    <View className="h-2 overflow-hidden rounded-pill bg-surfaceMuted">
      <View
        className="h-full rounded-pill"
        style={{
          width: `${Math.min(Math.max(progress, 0), 1) * 100}%`,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
