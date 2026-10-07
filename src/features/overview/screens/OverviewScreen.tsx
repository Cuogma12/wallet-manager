import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ScreenContainer } from '@/shared/components/atoms/ScreenContainer';
import { AppIcon } from '@/shared/components/atoms/icons/AppIcon';
import { ProgressBar } from '@/shared/components/atoms/ProgressBar';
import { StatCard } from '@/shared/components/molecules/StatCard';
import { SectionHeader } from '@/shared/components/molecules/SectionHeader';
import { TransactionRow } from '@/shared/components/molecules/TransactionRow';
import { colors } from '@/shared/constants/theme';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/shared/utils/format';
import { useI18n } from '@/shared/i18n';

// Feature screen module.

export default function OverviewScreen() {
  const { accounts, transactions, isReady } = useFinance();
  const { t } = useI18n();
  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );
  const monthlyIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthlySpent = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthlyBudget = 12_000_000;
  const budgetProgress = Math.min(monthlySpent / monthlyBudget, 1);

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerClassName="p-xl pb-[116px]"
        showsVerticalScrollIndicator={false}
      >
        <View className={uiClasses.rowBetween}>
          <View>
            <Text className="text-textMuted text-[10px] font-extrabold tracking-[1.1px]">
              {t('overview.dateLabel')}
            </Text>
            <Text className="mt-[5px] text-text text-[27px] font-extrabold -tracking-[0.7px]">
              {t('overview.greeting', { name: 'Cường' })}
            </Text>
          </View>
          <View
            className={cn(
              uiClasses.row,
              'gap-1.5 px-2.5 py-[7px] bg-surface rounded-pill',
            )}
          >
            <View className="w-[7px] h-[7px] rounded-[4px] bg-income" />
            <Text className="text-textMuted text-[10px] font-bold">
              {isReady ? t('common.offlineFirst') : t('common.loading')}
            </Text>
          </View>
        </View>

        <View className={cn(uiClasses.row, 'gap-[3px] mt-xl mb-md')}>
          <Text className="text-text text-[14px] font-extrabold">
            {t('overview.month')}
          </Text>
          <AppIcon name="chevron-down" size={18} color={colors.textMuted} />
        </View>

        <View className="p-xl bg-primary rounded-lg overflow-hidden">
          <View className="flex-row justify-between items-center">
            <Text className="text-[rgba(255,255,255,0.62)] text-[10px] font-extrabold tracking-[1px]">
              {t('overview.totalBalance')}
            </Text>
            <AppIcon
              name="eye-outline"
              size={21}
              color="rgba(255,255,255,0.72)"
            />
          </View>
          <Text className="mt-3 text-white text-[30px] font-extrabold -tracking-[0.6px]">
            {formatCurrency(totalBalance)}
          </Text>
          <View className="flex-row justify-between items-center mt-[18px]">
            <Text className="text-[rgba(255,255,255,0.64)] text-[12px]">
              {t('overview.allAccounts')}
            </Text>
            <View
              className={cn(
                uiClasses.row,
                'gap-1 px-2 py-[5px] rounded-pill bg-primarySoft',
              )}
            >
              <AppIcon name="trending-up" size={14} color={colors.primary} />
              <Text className="text-primary text-[11px] font-extrabold">
                +8,4%
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row gap-md mt-md">
          <StatCard
            label={t('overview.income')}
            value={formatCurrency(monthlyIncome)}
            icon="arrow-bottom-left"
            tone="income"
          />
          <StatCard
            label={t('overview.spent')}
            value={formatCurrency(monthlySpent)}
            icon="arrow-top-right"
            tone="expense"
          />
        </View>

        <SectionHeader
          title={t('overview.monthlyBudget')}
          actionLabel={t('common.details')}
        />
        <View className="p-lg bg-surface rounded-md">
          <View className="flex-row justify-between items-center">
            <Text className="text-textMuted text-[12px] font-semibold">
              {t('overview.used')}
            </Text>
            <Text className="text-text text-[13px] font-extrabold">
              {t('overview.budgetUsed', {
                spent: formatCurrency(monthlySpent),
                budget: formatCurrency(monthlyBudget),
              })}
            </Text>
          </View>
          <ProgressBar progress={budgetProgress} />
          <View className="flex-row justify-between mt-[9px]">
            <Text className="text-textMuted text-[11px] font-semibold">
              {t('overview.remaining', {
                amount: formatCurrency(monthlyBudget - monthlySpent),
              })}
            </Text>
            <Text className="text-textMuted text-[11px] font-semibold">
              {Math.round(budgetProgress * 100)}%
            </Text>
          </View>
        </View>

        <SectionHeader
          title={t('overview.weeklySpending')}
          actionLabel={t('common.seeReport')}
        />
        <View className="p-lg bg-surface rounded-md">
          <View className="h-[105px] flex-row items-end justify-between">
            {[42, 65, 30, 82, 52, 70, 38].map((height, index) => (
              <View key={index} className="items-center justify-end gap-2">
                <View
                  className="w-6 rounded-[8px] bg-primarySoft"
                  style={{ height }}
                />
                <Text className="text-textSubtle text-[10px] font-bold">
                  {
                    [
                      t('days.monday'),
                      t('days.tuesday'),
                      t('days.wednesday'),
                      t('days.thursday'),
                      t('days.friday'),
                      t('days.saturday'),
                      t('days.sunday'),
                    ][index]
                  }
                </Text>
              </View>
            ))}
          </View>
        </View>

        <SectionHeader
          title={t('overview.recentTransactions')}
          actionLabel={t('common.seeAll')}
          onAction={() => router.push('/transactions')}
        />
        <View className="px-md bg-surface rounded-md">
          {transactions.slice(0, 4).map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              account={accounts.find(
                (account) => account.id === transaction.accountId,
              )}
            />
          ))}
        </View>
      </ScrollView>
      <Pressable
        accessibilityLabel={t('overview.addTransaction')}
        onPress={() => router.push('/add')}
        className={cn(
          'absolute right-6 bottom-[95px] w-[58px] h-[58px] items-center justify-center rounded-[29px] bg-primary shadow-floating',
          'active:scale-[0.95]',
        )}
      >
        <AppIcon name="plus" size={28} color={colors.white} />
      </Pressable>
    </ScreenContainer>
  );
}
