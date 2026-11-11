import { Pressable, Text, View } from 'react-native';
import type { QuickTransactionTemplate } from '@/features/add-transaction/utils/quickTransaction';
import { useI18n } from '@/shared/i18n';
import { uiClasses } from '@/shared/styles/classes';
import { formatCurrency } from '@/shared/utils/format';

export function RecentTransactionTemplates({
  templates,
  accountName,
  onSelect,
  disabled,
}: {
  templates: QuickTransactionTemplate[];
  accountName: (template: QuickTransactionTemplate) => string;
  onSelect: (id: string) => void;
  disabled: boolean;
}) {
  const { t } = useI18n();
  if (!templates.length)
    return <Text className={uiClasses.hint}>{t('add.recent.empty')}</Text>;
  return (
    <View className="gap-sm">
      <Text className={uiClasses.fieldLabel}>{t('add.recent.title')}</Text>
      <View className="flex-row flex-wrap gap-sm">
        {templates.map((template) => (
          <Pressable
            key={template.id}
            accessibilityRole="button"
            accessibilityLabel={t('add.recent.use', {
              title: template.title,
              amount: formatCurrency(template.amount),
            })}
            disabled={disabled}
            onPress={() => onSelect(template.id)}
            className="min-w-[47%] flex-1 gap-1 rounded-md bg-surface p-md active:opacity-80"
          >
            <Text
              className="text-sm font-extrabold text-text"
              numberOfLines={1}
            >
              {template.title}
            </Text>
            <Text className="text-sm font-bold text-primary">
              {formatCurrency(template.amount)}
            </Text>
            <Text className={uiClasses.hint} numberOfLines={1}>
              {accountName(template)}
            </Text>
            {template.usageCount > 1 && (
              <Text className="text-xs font-bold text-textSubtle">
                {t('add.recent.usageCount', { count: template.usageCount })}
              </Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}
