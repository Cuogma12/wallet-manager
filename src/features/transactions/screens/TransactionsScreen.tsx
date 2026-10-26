import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import { ScreenContainer } from '@/shared/components/atoms/ScreenContainer';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { MonthPicker } from '@/shared/components/molecules/MonthPicker';
import { TransactionRow } from '@/shared/components/molecules/TransactionRow';
import { useI18n } from '@/shared/i18n';
import { colors } from '@/shared/constants/theme';
import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';

export default function TransactionsScreen() {
  const list = useTransactions();
  const { t } = useI18n();
  return (
    <ScreenContainer>
      <FlatList
        data={list.filteredTransactions}
        keyExtractor={(transaction) => transaction.id}
        contentContainerClassName="p-xl pb-32"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <View className="gap-lg pb-md">
            <View className="gap-sm">
              <Text className="text-xs font-bold text-textMuted">
                {t('transactions.eyebrow')}
              </Text>
              <Text
                accessibilityRole="header"
                className="text-3xl font-extrabold text-text"
              >
                {t('transactions.title')}
              </Text>
            </View>
            {list.loadError && (
              <View className="gap-sm">
                <Text accessibilityRole="alert" className={uiClasses.error}>
                  {t('common.loadFailed')}
                </Text>
                <AppButton label={t('common.retry')} onPress={list.refresh} />
              </View>
            )}
            <MonthPicker {...list} />
            <AppButton
              variant="secondary"
              label={t('overview.currentMonth')}
              onPress={list.currentMonth}
            />
            <TextInput
              accessibilityLabel={t('transactions.searchPlaceholder')}
              value={list.search}
              onChangeText={list.setSearch}
              placeholder={t('transactions.searchPlaceholder')}
              placeholderTextColor={colors.textSubtle}
              className={uiClasses.formInput}
            />
            <View className="flex-row flex-wrap gap-sm">
              {(['all', 'expense', 'income'] as const).map((filter) => (
                <Pressable
                  key={filter}
                  accessibilityRole="button"
                  accessibilityState={{ selected: list.filter === filter }}
                  onPress={() => list.setFilter(filter)}
                  className={cn(
                    'min-h-11 items-center justify-center rounded-pill bg-surface px-md py-sm',
                    list.filter === filter && 'bg-primary',
                  )}
                >
                  <Text
                    className={cn(
                      'text-sm font-bold text-text',
                      list.filter === filter && 'text-white',
                    )}
                  >
                    {t(
                      filter === 'expense'
                        ? 'transactions.expenses'
                        : filter === 'income'
                          ? 'transactions.income'
                          : 'transactions.all',
                    )}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text className={uiClasses.fieldLabel}>
              {t('transactions.resultCount', {
                count: list.filteredTransactions.length,
                month: list.monthLabel,
              })}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-surface px-md">
            <TransactionRow
              transaction={item}
              account={list.accountById.get(item.accountId)}
              onPress={() => list.openTransaction(item.id)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View className="gap-sm py-xl">
            <Text className={uiClasses.fieldLabel}>
              {t('transactions.emptyTitle')}
            </Text>
            <Text className={uiClasses.hint}>
              {t('transactions.emptyText')}
            </Text>
          </View>
        }
        ListFooterComponent={
          <View className="pt-lg">
            <AppButton
              label={t('overview.addTransaction')}
              onPress={list.addTransaction}
            />
          </View>
        }
      />
    </ScreenContainer>
  );
}
