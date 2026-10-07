import { cn } from '@/shared/styles/cn';
import { Pressable, Text } from 'react-native';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'items-center justify-center min-h-[52px] px-[18px] rounded-md',
        variant === 'danger'
          ? 'bg-error'
          : isPrimary
            ? 'bg-primary'
            : 'bg-surface',
        disabled && 'opacity-[0.5]',
        'active:scale-[0.98]',
      )}
    >
      <Text
        className={cn(
          'text-[14px] font-extrabold',
          isPrimary || variant === 'danger' ? 'text-white' : 'text-primary',
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
