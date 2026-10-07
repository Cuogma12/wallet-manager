import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '@/shared/constants/theme';
import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';

type Props = TextInputProps & { label: string; hint?: string };
export function FormField({ label, hint, className, ...inputProps }: Props) {
  return (
    <View className="gap-sm">
      <Text className={uiClasses.fieldLabel}>{label}</Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        placeholderTextColor={colors.textSubtle}
        className={cn(uiClasses.formInput, className)}
      />
      {hint && <Text className={uiClasses.hint}>{hint}</Text>}
    </View>
  );
}
