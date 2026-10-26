import type { AccountType } from '@/shared/types/finance';

export type AccountProvider = {
  id: string;
  type: Exclude<AccountType, 'cash'>;
  name: string;
  fullName: string;
  aliases: string;
};

// Curated offline snapshot, not a list of connected/API-supported institutions.
// Logo provenance and refresh instructions: docs/account-providers.md.
export const accountProviders: readonly AccountProvider[] = [
  {
    id: 'mbbank',
    type: 'bank',
    name: 'MBBank',
    fullName: 'Ngân hàng TMCP Quân đội',
    aliases: 'MB military',
  },
  {
    id: 'vietcombank',
    type: 'bank',
    name: 'Vietcombank',
    fullName: 'Ngân hàng TMCP Ngoại thương Việt Nam',
    aliases: 'VCB',
  },
  {
    id: 'vietinbank',
    type: 'bank',
    name: 'VietinBank',
    fullName: 'Ngân hàng TMCP Công thương Việt Nam',
    aliases: 'ICB CTG',
  },
  {
    id: 'bidv',
    type: 'bank',
    name: 'BIDV',
    fullName: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
    aliases: '',
  },
  {
    id: 'agribank',
    type: 'bank',
    name: 'Agribank',
    fullName: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam',
    aliases: 'VBA',
  },
  {
    id: 'techcombank',
    type: 'bank',
    name: 'Techcombank',
    fullName: 'Ngân hàng TMCP Kỹ thương Việt Nam',
    aliases: 'TCB',
  },
  {
    id: 'acb',
    type: 'bank',
    name: 'ACB',
    fullName: 'Ngân hàng TMCP Á Châu',
    aliases: '',
  },
  {
    id: 'vpbank',
    type: 'bank',
    name: 'VPBank',
    fullName: 'Ngân hàng TMCP Việt Nam Thịnh Vượng',
    aliases: 'VPB NEO',
  },
  {
    id: 'tpbank',
    type: 'bank',
    name: 'TPBank',
    fullName: 'Ngân hàng TMCP Tiên Phong',
    aliases: 'TPB LiveBank',
  },
  {
    id: 'sacombank',
    type: 'bank',
    name: 'Sacombank',
    fullName: 'Sacombank',
    aliases: 'STB',
  },
  {
    id: 'hdbank',
    type: 'bank',
    name: 'HDBank',
    fullName: 'Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh',
    aliases: 'HDB',
  },
  {
    id: 'vib',
    type: 'bank',
    name: 'VIB',
    fullName: 'Ngân hàng TMCP Quốc tế Việt Nam',
    aliases: '',
  },
  {
    id: 'shb',
    type: 'bank',
    name: 'SHB',
    fullName: 'Ngân hàng TMCP Sài Gòn - Hà Nội',
    aliases: '',
  },
  {
    id: 'msb',
    type: 'bank',
    name: 'MSB',
    fullName: 'Ngân hàng TMCP Hàng Hải',
    aliases: '',
  },
  {
    id: 'ocb',
    type: 'bank',
    name: 'OCB',
    fullName: 'Ngân hàng TMCP Phương Đông',
    aliases: '',
  },
  {
    id: 'eximbank',
    type: 'bank',
    name: 'Eximbank',
    fullName: 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam',
    aliases: 'EIB',
  },
  {
    id: 'lpbank',
    type: 'bank',
    name: 'LPBank',
    fullName: 'Ngân hàng TMCP Lộc Phát Việt Nam',
    aliases: 'LPB Lien Viet',
  },
  {
    id: 'seabank',
    type: 'bank',
    name: 'SeABank',
    fullName: 'Ngân hàng TMCP Đông Nam Á',
    aliases: 'SEAB',
  },
  {
    id: 'shinhan',
    type: 'bank',
    name: 'Shinhan Bank',
    fullName: 'Ngân hàng TNHH MTV Shinhan Việt Nam',
    aliases: 'SHBVN',
  },
  {
    id: 'cake',
    type: 'bank',
    name: 'CAKE',
    fullName: 'Ngân hàng số CAKE by VPBank',
    aliases: '',
  },
  { id: 'momo', type: 'wallet', name: 'MoMo', fullName: 'MoMo', aliases: '' },
  {
    id: 'zalopay',
    type: 'wallet',
    name: 'ZaloPay',
    fullName: 'ZaloPay',
    aliases: 'Zalo Pay',
  },
  {
    id: 'shopeepay',
    type: 'wallet',
    name: 'ShopeePay',
    fullName: 'ShopeePay',
    aliases: 'Shopee Pay AirPay',
  },
  {
    id: 'viettelmoney',
    type: 'wallet',
    name: 'Viettel Money',
    fullName: 'Viettel Money',
    aliases: 'ViettelPay VTLMONEY',
  },
  {
    id: 'vnptmoney',
    type: 'wallet',
    name: 'VNPT Money',
    fullName: 'VNPT Money',
    aliases: 'VNPTPay',
  },
];

export function getAccountProvider(id?: string | null) {
  return accountProviders.find((provider) => provider.id === id);
}
