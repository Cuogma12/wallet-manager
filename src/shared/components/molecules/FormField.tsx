import { Text, View, type TextInputProps } from 'react-native';
import { AppInput } from '@/shared/components/atoms/AppInput';
import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';

type Props = TextInputProps & { label: string; hint?: string };
export function FormField({ label, hint, className, ...inputProps }: Props) {
  return (
    <View className="min-w-0 w-full gap-sm">
      <Text className={uiClasses.fieldLabel}>{label}</Text>
      <AppInput
        {...inputProps}
        accessibilityLabel={label}
        className={cn(uiClasses.formInput, className)}
      />
      {hint && <Text className={uiClasses.hint}>{hint}</Text>}
    </View>
  );
}
