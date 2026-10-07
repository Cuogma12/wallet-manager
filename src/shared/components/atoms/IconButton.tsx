import { cn } from '@/shared/styles/cn';
import { Pressable } from 'react-native';
import {
  AppIcon,
  type AppIconName,
} from '@/shared/components/atoms/icons/AppIcon';
import { colors } from '@/shared/constants/theme';

type Props = {
  name: AppIconName;
  onPress?: () => void;
  accessibilityLabel: string;
  color?: string;
  size?: number;
  variant?: 'surface' | 'primary';
  disabled?: boolean;
};

export function IconButton({
  name,
  onPress,
  accessibilityLabel,
  color,
  size = 20,
  variant = 'surface',
  disabled = false,
}: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'w-11 h-11 items-center justify-center rounded-[14px]',
        isPrimary ? 'bg-primary' : 'bg-surface',
        'active:opacity-[0.7]',
        disabled && 'opacity-50',
      )}
    >
      <AppIcon
        name={name}
        size={size}
        color={color ?? (isPrimary ? colors.white : colors.primary)}
      />
    </Pressable>
  );
}
