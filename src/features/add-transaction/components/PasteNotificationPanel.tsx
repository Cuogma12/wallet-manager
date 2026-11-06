import { Text, View } from 'react-native';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { AppInput } from '@/shared/components/atoms/AppInput';
import { useI18n } from '@/shared/i18n';
import { cn } from '@/shared/styles/cn';
import { uiClasses } from '@/shared/styles/classes';

export function PasteNotificationPanel({
  value,
  onChange,
  onAnalyze,
  ready,
  error,
  canAnalyze,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  ready: boolean;
  error: string;
  canAnalyze: boolean;
  disabled: boolean;
}) {
  const { t } = useI18n();
  return (
    <View className="gap-md rounded-md bg-surface p-md">
      <View className="gap-xs">
        <Text className={uiClasses.fieldLabel}>{t('add.paste.title')}</Text>
        <Text className={uiClasses.hint}>{t('add.paste.hint')}</Text>
      </View>
      <AppInput
        accessibilityLabel={t('add.paste.title')}
        editable={!disabled}
        value={value}
        onChangeText={onChange}
        placeholder={t('add.paste.placeholder')}
        multiline
        className={cn(uiClasses.formInput, 'h-28 pt-md align-top')}
      />
      <AppButton
        label={t('add.paste.analyze')}
        onPress={onAnalyze}
        variant="secondary"
        disabled={disabled || !canAnalyze}
      />
      {!!error && (
        <Text accessibilityRole="alert" className={uiClasses.error}>
          {error}
        </Text>
      )}
      {ready && (
        <Text
          accessibilityLiveRegion="polite"
          className="text-sm font-bold text-income"
        >
          {t('add.paste.ready')}
        </Text>
      )}
      <Text className={uiClasses.hint}>{t('add.paste.privacy')}</Text>
    </View>
  );
}
