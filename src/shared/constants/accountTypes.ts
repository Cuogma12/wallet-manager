import { colors } from '@/shared/constants/theme';

export const accountTypes = [
  {
    type: 'cash',
    labelKey: 'accountTypes.cash',
    icon: 'cash-100',
    color: colors.warning,
  },
  {
    type: 'bank',
    labelKey: 'accountTypes.bank',
    icon: 'bank-outline',
    color: colors.primary,
  },
  {
    type: 'wallet',
    labelKey: 'accountTypes.wallet',
    icon: 'wallet-outline',
    color: colors.purple,
  },
] as const;
