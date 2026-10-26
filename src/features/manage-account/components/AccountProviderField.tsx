import { Pressable, Text, View } from 'react-native';
import { InstitutionIcon } from '@/shared/components/atoms/icons/InstitutionIcon';
import { AppIcon } from '@/shared/components/atoms/icons/AppIcon';
import { FormField } from '@/shared/components/molecules/FormField';
import type { AccountProvider } from '@/shared/constants/accountProviders';
import type { AccountType } from '@/shared/types/finance';
import { colors } from '@/shared/constants/theme';
import { useI18n } from '@/shared/i18n';
import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';

export function AccountProviderField({
  type,
  providerId,
  selected,
  providers,
  query,
  onQueryChange,
  expanded,
  onToggle,
  onSelect,
  disabled,
}: {
  type: AccountType;
  providerId: string | null;
  selected?: AccountProvider;
  providers: readonly AccountProvider[];
  query: string;
  onQueryChange: (query: string) => void;
  expanded: boolean;
  onToggle: () => void;
  onSelect: (id: string | null) => void;
  disabled: boolean;
}) {
  const { t } = useI18n();
  return (
    <View className="gap-sm">
      <Text className={uiClasses.fieldLabel}>
        {t(
          type === 'bank'
            ? 'accountProviders.bankLabel'
            : 'accountProviders.walletLabel',
        )}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('accountProviders.choose')}
        aria-expanded={expanded}
        accessibilityState={{ expanded, disabled }}
        disabled={disabled}
        onPress={onToggle}
        className={uiClasses.choiceRow}
      >
        <InstitutionIcon providerId={providerId} type={type} />
        <Text className="flex-1 text-text font-semibold">
          {selected?.name ??
            t(
              providerId
                ? 'accountProviders.unknown'
                : 'accountProviders.other',
            )}
        </Text>
        <AppIcon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          color={colors.primary}
        />
      </Pressable>
      <Text className={uiClasses.hint}>{t('accountProviders.manualHint')}</Text>
      {expanded && (
        <View className="gap-sm">
          <FormField
            label={t('accountProviders.search')}
            placeholder={t('accountProviders.searchPlaceholder')}
            value={query}
            onChangeText={onQueryChange}
            editable={!disabled}
            autoCorrect={false}
            maxLength={100}
          />
          <Pressable
            accessibilityRole="radio"
            accessibilityLabel={t('accountProviders.other')}
            aria-checked={providerId === null}
            accessibilityState={{ checked: providerId === null, disabled }}
            disabled={disabled}
            onPress={() => onSelect(null)}
            className={cn(
              uiClasses.choiceRow,
              providerId === null && 'bg-primarySoft',
            )}
          >
            <InstitutionIcon type={type} />
            <Text className="flex-1 text-text font-semibold">
              {t('accountProviders.other')}
            </Text>
            {providerId === null && (
              <AppIcon name="check" color={colors.primary} />
            )}
          </Pressable>
          {providers.map((provider) => (
            <Pressable
              key={provider.id}
              accessibilityRole="radio"
              accessibilityLabel={provider.name}
              aria-checked={providerId === provider.id}
              accessibilityState={{
                checked: providerId === provider.id,
                disabled,
              }}
              disabled={disabled}
              onPress={() => onSelect(provider.id)}
              className={cn(
                uiClasses.choiceRow,
                providerId === provider.id && 'bg-primarySoft',
              )}
            >
              <InstitutionIcon providerId={provider.id} type={type} />
              <View className="flex-1 gap-1">
                <Text className="text-text font-semibold">{provider.name}</Text>
                <Text className={uiClasses.hint}>{provider.fullName}</Text>
              </View>
              {providerId === provider.id && (
                <AppIcon name="check" color={colors.primary} />
              )}
            </Pressable>
          ))}
          {providers.length === 0 && (
            <Text className={uiClasses.hint}>
              {t('accountProviders.empty')}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
