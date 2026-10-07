import { cn } from '@/shared/styles/cn';
import { Text } from 'react-native';

type Props = {
  label: string;
  tone?: 'warning' | 'success' | 'neutral';
};

export function Badge({ label, tone = 'neutral' }: Props) {
  return (
    <Text
      className={cn(
        'rounded-pill px-1.5 py-0.5 text-[9px] font-bold',
        tone === 'warning'
          ? 'text-warning bg-warningSoft'
          : tone === 'success'
            ? 'text-income bg-incomeSoft'
            : 'text-textMuted bg-surfaceMuted',
      )}
    >
      {label}
    </Text>
  );
}
