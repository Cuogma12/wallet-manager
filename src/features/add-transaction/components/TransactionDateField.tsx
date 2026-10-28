import { Pressable, ScrollView, Text, View } from 'react-native';
import type { useTransactionDate } from '@/features/add-transaction/hooks/useTransactionDate';
import { FormField } from '@/shared/components/molecules/FormField';
import { MonthPicker } from '@/shared/components/molecules/MonthPicker';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { useI18n } from '@/shared/i18n';
import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';

const weekdays = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export function TransactionDateField({
  model,
}: {
  model: ReturnType<typeof useTransactionDate>;
}) {
  const { t } = useI18n();
  return (
    <View className="mt-lg min-w-0 w-full gap-sm">
      <FormField
        label={t('add.date')}
        placeholder={t('salary.datePlaceholder')}
        hint={t('add.dateHint')}
        value={model.date}
        onChangeText={model.changeDate}
        keyboardType="numbers-and-punctuation"
        maxLength={10}
        editable={!model.disabled}
      />
      <View className="flex-row flex-wrap gap-sm">
        <AppButton
          label={t('add.today')}
          variant="secondary"
          onPress={model.chooseToday}
          disabled={model.disabled}
        />
        <AppButton
          label={t('add.yesterday')}
          variant="secondary"
          onPress={model.chooseYesterday}
          disabled={model.disabled}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('add.chooseDate')}
        aria-expanded={model.expanded}
        accessibilityState={{
          expanded: model.expanded,
          disabled: model.disabled,
        }}
        disabled={model.disabled}
        onPress={model.toggleCalendar}
        className="min-h-11 items-center justify-center rounded-md bg-primarySoft px-md"
      >
        <Text className="text-base font-bold text-primary">
          {t(model.expanded ? 'add.closeCalendar' : 'add.chooseDate')}
        </Text>
      </Pressable>
      {model.expanded && (
        <View className="min-w-0 gap-sm rounded-md bg-surface p-sm">
          <MonthPicker {...model} />
          <Text className={uiClasses.hint}>{t('add.calendarHint')}</Text>
          <ScrollView
            horizontal
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator
          >
            <View>
              <View className={uiClasses.calendarWeek}>
                {weekdays.map((day) => (
                  <Text
                    key={day}
                    className={cn(
                      uiClasses.calendarDay,
                      'text-center text-xs text-textMuted',
                    )}
                  >
                    {t(`add.weekdays.${day}`)}
                  </Text>
                ))}
              </View>
              {model.weeks.map((week, index) => (
                <View key={index} className={uiClasses.calendarWeek}>
                  {week.map((date, column) =>
                    date === null ? (
                      <View key={column} className={uiClasses.calendarDay} />
                    ) : (
                      <Pressable
                        key={date}
                        accessibilityRole="button"
                        accessibilityLabel={t('add.selectDate', { date })}
                        aria-selected={date === model.date}
                        accessibilityState={{
                          selected: date === model.date,
                          disabled: model.disabled,
                        }}
                        disabled={model.disabled}
                        onPress={() => model.selectDate(date)}
                        className={cn(
                          uiClasses.calendarDay,
                          'rounded-sm',
                          date === model.today && 'bg-primarySoft',
                          date === model.date && 'bg-primary',
                        )}
                      >
                        <Text
                          className={cn(
                            'text-base font-semibold text-text',
                            date === model.date && 'text-white',
                          )}
                        >
                          {Number(date.slice(0, 2))}
                        </Text>
                      </Pressable>
                    ),
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}
