import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';
import { colors } from '@/shared/constants/theme';

export type AppIconName = keyof typeof MaterialCommunityIcons.glyphMap;

type Props = {
  name: AppIconName;
  size?: number;
  color?: string | ColorValue;
};

export function AppIcon({ name, size = 20, color = colors.primary }: Props) {
  return (
    <MaterialCommunityIcons name={name} size={size} color={color as string} />
  );
}
