import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '@/shared/components/atoms/ScreenContainer';
import { AppIcon } from '@/shared/components/atoms/icons/AppIcon';
import { IconButton } from '@/shared/components/atoms/IconButton';
import { SectionHeader } from '@/shared/components/molecules/SectionHeader';
import { TransactionRow } from '@/shared/components/molecules/TransactionRow';
import { colors } from '@/shared/constants/theme';
import { useI18n } from '@/shared/i18n';
import { useFinance } from '@/context/FinanceContext';

// Feature screen module.

type Filter = 'all' | 'expense' | 'income';

export default function TransactionsScreen() {
  const { accounts, transactions } = useFinance();
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const matchesFilter = filter === 'all' || transaction.type === filter;
        const matchesSearch = `${transaction.title} ${transaction.category}`
          .toLowerCase()
          .includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
      }),
    [filter, search, transactions],
  );

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerClassName="p-xl pb-[110px]"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-textMuted text-[10px] font-extrabold tracking-[1.1px]">
              {t('transactions.eyebrow')}
            </Text>
            <Text className="mt-1 text-text text-[28px] font-extrabold -tracking-[0.7px]">
              {t('transactions.title')}
            </Text>
          </View>
          <IconButton
            name="tune-variant"
            accessibilityLabel={t('transactions.filter')}
          />
        </View>
        <View
          className={cn(
            uiClasses.row,
            'gap-[9px] mt-6 px-3.5 h-12 rounded-[14px] bg-surface',
          )}
        >
          <AppIcon name="magnify" size={20} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('transactions.searchPlaceholder')}
            placeholderTextColor={colors.textSubtle}
            className="flex-1 text-text text-[14px]"
          />
        </View>
        <View className="flex-row gap-2 mt-4">
          {(
            [
              ['all', t('transactions.all')],
              ['expense', t('transactions.expenses')],
              ['income', t('transactions.income')],
            ] as const
          ).map(([value, label]) => (
            <Pressable
              key={value}
              onPress={() => setFilter(value)}
              className={cn(
                'px-3.5 py-[9px] rounded-pill bg-surface',
                filter === value && 'bg-primary',
              )}
            >
              <Text
                className={cn(
                  'text-textMuted text-[12px] font-bold',
                  filter === value && 'text-white',
                )}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
        <SectionHeader
          title={t('transactions.resultCount', {
            count: filteredTransactions.length,
          })}
        />
        <View className="px-md bg-surface rounded-md">
          {filteredTransactions.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              account={accounts.find(
                (account) => account.id === transaction.accountId,
              )}
            />
          ))}
        </View>
        {filteredTransactions.length === 0 && (
          <View className="items-center py-15">
            <AppIcon
              name="file-search-outline"
              size={38}
              color={colors.textSubtle}
            />
            <Text className="mt-3 text-text text-[16px] font-extrabold">
              {t('transactions.emptyTitle')}
            </Text>
            <Text className="mt-[5px] text-textMuted text-[13px]">
              {t('transactions.emptyText')}
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
