import { Pressable, Text, View } from 'react-native';
import { AppIcon } from '@/shared/components/atoms/icons/AppIcon';
import { InstitutionIcon } from '@/shared/components/atoms/icons/InstitutionIcon';
import { colors } from '@/shared/constants/theme';
import type { Account } from '@/shared/types/finance';
import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';

export function AccountPicker({
  accounts,
  selectedId,
  label,
  onChange,
  disabled,
}: {
  accounts: Account[];
  selectedId: string;
  label: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <View className="gap-sm">
      <Text className={uiClasses.fieldLabel}>{label}</Text>
      {accounts.map((account) => (
        <Pressable
          key={account.id}
          accessibilityRole="radio"
          accessibilityState={{ selected: selectedId === account.id, disabled }}
          accessibilityLabel={account.name}
          disabled={disabled}
          onPress={() => onChange(account.id)}
          className={cn(
            uiClasses.row,
            'min-h-[52px] gap-md rounded-md bg-surface p-md',
            selectedId === account.id && 'bg-primarySoft',
          )}
        >
          <InstitutionIcon
            providerId={account.providerId}
            type={account.type}
          />
          <Text className="flex-1 text-text font-semibold">{account.name}</Text>
          {selectedId === account.id && (
            <AppIcon name="check" color={colors.primary} size={20} />
          )}
        </Pressable>
      ))}
    </View>
  );
}
