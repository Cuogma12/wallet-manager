import { Pressable, Text, View } from 'react-native';
import { useI18n } from '@/shared/i18n';
import { cn } from '@/shared/styles/cn';

type EntryMode = 'quick' | 'paste';

export function TransactionEntryModePicker({
  value,
  onChange,
  disabled,
}: {
  value: EntryMode;
  onChange: (value: EntryMode) => void;
  disabled: boolean;
}) {
  const { t } = useI18n();
  return (
    <View className="flex-row rounded-md bg-surfaceMuted p-1">
      {(['quick', 'paste'] as const).map((mode) => (
        <Pressable
          key={mode}
          accessibilityRole="tab"
          accessibilityState={{ selected: value === mode, disabled }}
          disabled={disabled}
          onPress={() => onChange(mode)}
          className={cn(
            'min-h-11 flex-1 items-center justify-center rounded-md px-sm',
            value === mode && 'bg-surface',
          )}
        >
          <Text
            className={cn(
              'text-sm font-bold text-textMuted',
              value === mode && 'text-primary',
            )}
          >
            {t(`add.modes.${mode}`)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
