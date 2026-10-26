import { Pressable, Text, View } from 'react-native';
import { AppIcon } from '@/shared/components/atoms/icons/AppIcon';
import { accountTypes } from '@/shared/constants/accountTypes';
import { colors } from '@/shared/constants/theme';
import type { AccountType } from '@/shared/types/finance';
import { useI18n } from '@/shared/i18n';
import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';

export function AccountTypePicker({
  value,
  onChange,
  disabled,
  includeCash = true,
}: {
  value: AccountType;
  onChange: (type: AccountType) => void;
  disabled?: boolean;
  includeCash?: boolean;
}) {
  const { t } = useI18n();
  return (
    <View className="gap-sm">
      <Text className={uiClasses.fieldLabel}>{t('manageAccount.type')}</Text>
      {accountTypes.map((item) =>
        !includeCash && item.type === 'cash' ? null : (
          <Pressable
            key={item.type}
            accessibilityRole="radio"
            accessibilityLabel={t(item.labelKey)}
            aria-checked={value === item.type}
            accessibilityState={{ checked: value === item.type, disabled }}
            disabled={disabled}
            onPress={() => onChange(item.type)}
            className={cn(
              uiClasses.choiceRow,
              value === item.type && 'bg-primarySoft',
            )}
          >
            <AppIcon name={item.icon} size={22} color={colors.primary} />
            <Text className="flex-1 text-text font-semibold">
              {t(item.labelKey)}
            </Text>
            {value === item.type && (
              <AppIcon name="check" size={20} color={colors.primary} />
            )}
          </Pressable>
        ),
      )}
    </View>
  );
}
