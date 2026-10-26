import { Text, View } from 'react-native';
import { IconButton } from '@/shared/components/atoms/IconButton';
import { useI18n } from '@/shared/i18n';
import { uiClasses } from '@/shared/styles/classes';

type Props = {
  month: string;
  monthLabel: string;
  previousMonth: () => void;
  nextMonth: () => void;
  disabled?: boolean;
};

export function MonthPicker({
  month,
  monthLabel,
  previousMonth,
  nextMonth,
  disabled = false,
}: Props) {
  const { t } = useI18n();
  return (
    <View className={uiClasses.rowBetween}>
      <IconButton
        name="chevron-left"
        accessibilityLabel={t('salary.previousMonth')}
        onPress={previousMonth}
        disabled={disabled || month === '1900-01'}
      />
      <Text
        accessibilityRole="header"
        accessibilityLiveRegion="polite"
        className="flex-1 px-sm text-center text-base font-bold text-text"
      >
        {monthLabel}
      </Text>
      <IconButton
        name="chevron-right"
        accessibilityLabel={t('salary.nextMonth')}
        onPress={nextMonth}
        disabled={disabled || month === '9999-12'}
      />
    </View>
  );
}
