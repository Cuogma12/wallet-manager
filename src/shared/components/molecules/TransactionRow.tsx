import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';
import { Pressable, Text, View } from 'react-native';
import {
  AppIcon,
  type AppIconName,
} from '@/shared/components/atoms/icons/AppIcon';
import { Badge } from '@/shared/components/atoms/Badge';
import { colors } from '@/shared/constants/theme';
import { formatCurrency, formatDateLabel } from '@/shared/utils/format';
import type { Account, Transaction } from '@/shared/types/finance';
import { useI18n } from '@/shared/i18n';

type Props = {
  transaction: Transaction;
  account?: Account;
  onPress?: () => void;
};

export function TransactionRow({ transaction, account, onPress }: Props) {
  const { t, intlLocale } = useI18n();
  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      className={cn(uiClasses.row, 'py-[13px] gap-md', 'active:opacity-[0.65]')}
    >
      <View
        className={cn(
          uiClasses.center,
          'w-11 h-11 rounded-md',
          isIncome ? 'bg-incomeSoft' : 'bg-surfaceMuted',
        )}
      >
        <AppIcon
          name={transaction.categoryIcon as AppIconName}
          size={21}
          color={isIncome ? colors.income : colors.primary}
        />
      </View>
      <View className="flex-1 gap-1">
        <View className={cn(uiClasses.row, 'gap-[7px]')}>
          <Text
            numberOfLines={1}
            className="shrink text-text text-[15px] font-bold"
          >
            {transaction.title}
          </Text>
          {transaction.source !== 'manual' && (
            <Badge label={t('common.automatic')} tone="warning" />
          )}
        </View>
        <Text className="text-textMuted text-[12px]">
          {account?.name ?? t('add.account')} ·{' '}
          {formatDateLabel(transaction.occurredAt, intlLocale)}
        </Text>
      </View>
      <Text
        className={cn(
          'text-[13px] font-extrabold text-right',
          isIncome ? 'text-income' : 'text-text',
        )}
      >
        {isTransfer ? '' : isIncome ? '+' : '-'}
        {formatCurrency(transaction.amount)}
      </Text>
    </Pressable>
  );
}
