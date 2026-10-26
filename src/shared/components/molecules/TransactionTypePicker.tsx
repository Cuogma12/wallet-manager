import { Pressable, Text, View } from 'react-native';
import { useI18n } from '@/shared/i18n';
import { cn } from '@/shared/styles/cn';

export function TransactionTypePicker({
  value,
  onChange,
  disabled = false,
}: {
  value: 'expense' | 'income';
  onChange: (value: 'expense' | 'income') => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  return (
    <View className="flex-row rounded-md bg-surfaceMuted p-1">
      {(['expense', 'income'] as const).map((type) => (
        <Pressable
          key={type}
          accessibilityRole="button"
          accessibilityState={{ selected: type === value, disabled }}
          disabled={disabled}
          onPress={() => onChange(type)}
          className={cn(
            'min-h-11 flex-1 items-center justify-center rounded-md px-md py-sm',
            type === value && 'bg-primary',
          )}
        >
          <Text
            className={cn(
              'font-bold text-textMuted',
              type === value && 'text-white',
            )}
          >
            {t(`add.${type}`)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
