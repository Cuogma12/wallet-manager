import { Text, View } from 'react-native';
import { AppInput } from '@/shared/components/atoms/AppInput';
import { useI18n } from '@/shared/i18n';
import { uiClasses } from '@/shared/styles/classes';

export function QuickTextEntry({
  value,
  onChange,
  onSubmit,
  source,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  source: 'history' | 'rules' | null;
  disabled: boolean;
}) {
  const { t } = useI18n();
  return (
    <View className="gap-sm rounded-md bg-primarySoft p-md">
      <View className="gap-xs">
        <Text className={uiClasses.fieldLabel}>{t('add.quickText.title')}</Text>
        <Text className={uiClasses.hint}>{t('add.quickText.hint')}</Text>
      </View>
      <AppInput
        accessibilityLabel={t('add.quickText.title')}
        editable={!disabled}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        returnKeyType="done"
        placeholder={t('add.quickText.placeholder')}
        className={uiClasses.formInput}
      />
      {source && (
        <Text
          accessibilityLiveRegion="polite"
          className="text-sm font-bold text-income"
        >
          {t(
            source === 'history'
              ? 'add.quickText.readyFromHistory'
              : 'add.quickText.ready',
          )}
        </Text>
      )}
    </View>
  );
}
