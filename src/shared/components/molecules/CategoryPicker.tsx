import { Pressable, Text, View } from 'react-native';
import {
  AppIcon,
  type AppIconName,
} from '@/shared/components/atoms/icons/AppIcon';
import { expenseCategories } from '@/shared/constants/categories';
import { colors } from '@/shared/constants/theme';
import { useI18n } from '@/shared/i18n';
import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';

const incomeCategories = [
  {
    key: 'other',
    labelKey: 'categories.other',
    icon: 'dots-horizontal-circle-outline',
  },
  { key: 'salary', labelKey: 'categories.salary', icon: 'briefcase-outline' },
] as const;

export function CategoryPicker({
  type,
  selectedKey,
  onChange,
  disabled = false,
}: {
  type: 'expense' | 'income';
  selectedKey: string;
  onChange: (key: string) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const categories = type === 'income' ? incomeCategories : expenseCategories;
  return (
    <View className="gap-sm">
      <Text className={uiClasses.fieldLabel}>{t('add.category')}</Text>
      <View className="flex-row flex-wrap gap-sm">
        {categories.map((item) => (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            accessibilityState={{
              selected: selectedKey === item.key,
              disabled,
            }}
            onPress={() => onChange(item.key)}
            disabled={disabled}
            className={cn(
              'min-h-11 flex-row items-center gap-sm rounded-md bg-surface px-md py-sm',
              selectedKey === item.key && 'bg-primary',
            )}
          >
            <AppIcon
              name={item.icon as AppIconName}
              size={20}
              color={selectedKey === item.key ? colors.white : colors.primary}
            />
            <Text
              className={cn(
                'text-sm font-bold text-text',
                selectedKey === item.key && 'text-white',
              )}
            >
              {t(item.labelKey)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
