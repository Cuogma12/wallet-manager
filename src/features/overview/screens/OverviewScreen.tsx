import { ScrollView, Text, View } from 'react-native';
import { useOverview } from '@/features/overview/hooks/useOverview';
import { SpendingChart } from '@/features/overview/components/SpendingChart';
import { ScreenContainer } from '@/shared/components/atoms/ScreenContainer';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { MonthPicker } from '@/shared/components/molecules/MonthPicker';
import { StatCard } from '@/shared/components/molecules/StatCard';
import { SectionHeader } from '@/shared/components/molecules/SectionHeader';
import { TransactionRow } from '@/shared/components/molecules/TransactionRow';
import { useI18n } from '@/shared/i18n';
import { formatCurrency } from '@/shared/utils/format';
import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';

export default function OverviewScreen() {
  const overview = useOverview();
  const { t } = useI18n();
  return (
    <ScreenContainer>
      <ScrollView
        contentContainerClassName="p-xl pb-32 gap-lg"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-sm">
          <Text className="text-xs font-bold text-textMuted">
            {overview.dateLabel}
          </Text>
          <Text
            accessibilityRole="header"
            className="text-3xl font-extrabold text-text"
          >
            {t('nav.overview')}
          </Text>
          <Text className={uiClasses.hint}>{t('common.offlineFirst')}</Text>
        </View>
        {overview.loadError && (
          <View className="gap-sm">
            <Text accessibilityRole="alert" className={uiClasses.error}>
              {t('common.loadFailed')}
            </Text>
            <AppButton label={t('common.retry')} onPress={overview.refresh} />
          </View>
        )}
        <View className="gap-sm rounded-lg bg-primary p-xl">
          <Text className="text-xs font-bold text-white">
            {t('overview.totalBalance')}
          </Text>
          <Text className="text-3xl font-extrabold text-white">
            {formatCurrency(overview.totalBalance)}
          </Text>
          <Text className="text-xs leading-5 text-white">
            {t('overview.currentBalanceHint')}
          </Text>
        </View>
        <MonthPicker {...overview} />
        <AppButton
          variant="secondary"
          label={t('overview.currentMonth')}
          onPress={overview.currentMonth}
        />
        <View className="flex-row gap-md">
          <StatCard
            label={t('overview.income')}
            value={formatCurrency(overview.summary.income)}
            icon="arrow-bottom-left"
            tone="income"
          />
          <StatCard
            label={t('overview.spent')}
            value={formatCurrency(overview.summary.expense)}
            icon="arrow-top-right"
            tone="expense"
          />
        </View>
        <View className={cn(uiClasses.card, 'gap-sm p-lg')}>
          <Text className={uiClasses.fieldLabel}>{t('overview.net')}</Text>
          <Text className="text-2xl font-extrabold text-text">
            {formatCurrency(overview.summary.net)}
          </Text>
          <Text className={uiClasses.hint}>{t('overview.cashFlowHint')}</Text>
        </View>
        <SectionHeader title={t('overview.weeklySpending')} />
        <SpendingChart days={overview.summary.dailyExpenses} />
        <SectionHeader
          title={t('overview.recentTransactions')}
          actionLabel={t('common.seeAll')}
          onAction={overview.seeAll}
        />
        {overview.summary.transactions.length ? (
          <View className={cn(uiClasses.card, 'px-md')}>
            {overview.summary.transactions.slice(0, 4).map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                account={overview.accountById.get(transaction.accountId)}
                onPress={() => overview.openTransaction(transaction.id)}
              />
            ))}
          </View>
        ) : (
          <View className={cn(uiClasses.card, 'gap-sm p-lg')}>
            <Text className={uiClasses.fieldLabel}>
              {t('overview.emptyTitle')}
            </Text>
            <Text className={uiClasses.hint}>{t('overview.emptyText')}</Text>
          </View>
        )}
        <AppButton
          label={t('overview.addTransaction')}
          onPress={overview.addTransaction}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
