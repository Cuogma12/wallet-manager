import { Text, View } from 'react-native';
import {
  AppIcon,
  type AppIconName,
} from '@/shared/components/atoms/icons/AppIcon';
import { Card } from '@/shared/components/atoms/Card';
import { colors } from '@/shared/constants/theme';
import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';

type Props = {
  label: string;
  value: string;
  icon: AppIconName;
  tone: 'income' | 'expense';
};

export function StatCard({ label, value, icon, tone }: Props) {
  const isIncome = tone === 'income';
  return (
    <Card className="flex-1 p-md">
      <View
        className={cn(
          uiClasses.center,
          'w-[30px] h-[30px] rounded-[10px] mb-2.5',
          isIncome ? 'bg-incomeSoft' : 'bg-expenseSoft',
        )}
      >
        <AppIcon
          name={icon}
          size={18}
          color={isIncome ? colors.income : colors.expense}
        />
      </View>
      <Text className="text-textMuted text-[12px] font-semibold">{label}</Text>
      <Text className="mt-[5px] text-text text-[14px] font-extrabold">
        {value}
      </Text>
    </Card>
  );
}
