import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii } from '@/shared/constants/theme';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export function AppButton({ label, onPress, variant = 'primary', disabled = false }: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, isPrimary ? styles.primary : styles.secondary, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center', minHeight: 52, paddingHorizontal: 18, borderRadius: radii.md },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface },
  label: { fontSize: 14, fontWeight: '800' },
  primaryLabel: { color: colors.white },
  secondaryLabel: { color: colors.primary },
  disabled: { opacity: 0.5 },
  pressed: { transform: [{ scale: 0.98 }] },
});
