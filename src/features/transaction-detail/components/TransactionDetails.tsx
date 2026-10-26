import { Text, View } from 'react-native';
import { useI18n } from '@/shared/i18n';
import type { Transaction } from '@/shared/types/finance';
import { formatCurrency } from '@/shared/utils/format';
import { formatMonth } from '@/shared/utils/financeValidation';
import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';

export function TransactionDetails({
  transaction,
  accountName,
  categoryLabel,
  dateLabel,
}: {
  transaction: Transaction;
  accountName: string;
  categoryLabel: string;
  dateLabel: string;
}) {
  const { t, intlLocale } = useI18n();
  return (
    <View className={cn(uiClasses.card, 'gap-md p-lg')}>
      <Text className="text-2xl font-extrabold text-text">
        {transaction.title}
      </Text>
      <Text className="text-3xl font-extrabold text-text">
        {formatCurrency(transaction.amount)}
      </Text>
      <Text className={uiClasses.fieldLabel}>
        {t(`transactionDetail.types.${transaction.type}`)}
      </Text>
      <Text className={uiClasses.hint}>
        {t('transactionDetail.accountValue', { name: accountName })}
      </Text>
      <Text className={uiClasses.hint}>
        {t('transactionDetail.categoryValue', { name: categoryLabel })}
      </Text>
      <Text className={uiClasses.hint}>{dateLabel}</Text>
      {transaction.salaryMonth && (
        <Text className={uiClasses.hint}>
          {t('transactionDetail.salaryValue', {
            month: formatMonth(transaction.salaryMonth, intlLocale),
          })}
        </Text>
      )}
      <Text className={uiClasses.hint}>
        {t(`transactionDetail.sources.${transaction.source}`)}
      </Text>
      {transaction.note && (
        <View className="gap-sm">
          <Text className={uiClasses.fieldLabel}>{t('add.note')}</Text>
          <Text className="text-base text-text">{transaction.note}</Text>
        </View>
      )}
    </View>
  );
}
