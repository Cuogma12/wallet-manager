import { Pressable, StyleSheet } from 'react-native';
import { AppIcon, type AppIconName } from '@/shared/components/atoms/icons/AppIcon';
import { colors } from '@/shared/constants/theme';

type Props = {
  name: AppIconName;
  onPress?: () => void;
  accessibilityLabel: string;
  color?: string;
  size?: number;
  variant?: 'surface' | 'primary';
};

export function IconButton({ name, onPress, accessibilityLabel, color, size = 20, variant = 'surface' }: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.button, isPrimary ? styles.primary : styles.surface, pressed && styles.pressed]}
    >
      <AppIcon name={name} size={size} color={color ?? (isPrimary ? colors.white : colors.primary)} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  surface: { backgroundColor: colors.surface },
  primary: { backgroundColor: colors.primary },
  pressed: { opacity: 0.7 },
});
