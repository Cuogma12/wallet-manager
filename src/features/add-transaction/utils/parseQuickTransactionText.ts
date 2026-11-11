import { normalizeCategoryName } from '@/shared/utils/category';

type ExpenseCategory =
  'food' | 'transport' | 'shopping' | 'bills' | 'entertainment' | 'other';

export type ParsedQuickTransactionText = {
  amount: number;
  type: 'expense' | 'income';
  title: string;
  category: ExpenseCategory;
  date: 'today' | 'yesterday' | null;
  normalizedText: string;
};

type AmountMatch = {
  amount: number;
  index: number;
  length: number;
};

function safeAmount(value: number) {
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function findAmount(input: string): AmountMatch | null {
  const unitPattern =
    /(\d+(?:[.,]\d{1,2})?)\s*(k|nghìn|nghin|ngàn|ngan|tr|triệu|trieu)\b/iu;
  const unitMatch = unitPattern.exec(input);
  if (unitMatch) {
    const unit = normalizeCategoryName(unitMatch[2]);
    const multiplier = ['tr', 'trieu'].includes(unit) ? 1_000_000 : 1_000;
    const amount = safeAmount(
      Number(unitMatch[1].replace(',', '.')) * multiplier,
    );
    if (amount)
      return { amount, index: unitMatch.index, length: unitMatch[0].length };
  }

  const groupedMatch = /\d{1,3}(?:[.\s]\d{3})+/.exec(input);
  if (groupedMatch) {
    const amount = safeAmount(Number(groupedMatch[0].replace(/[.\s]/g, '')));
    if (amount)
      return {
        amount,
        index: groupedMatch.index,
        length: groupedMatch[0].length,
      };
  }

  const plainMatch = /(?:^|[^\d/-])(\d{4,})(?![\d/-])/.exec(input);
  if (!plainMatch) return null;
  const amount = safeAmount(Number(plainMatch[1]));
  if (!amount) return null;
  const prefixLength = plainMatch[0].length - plainMatch[1].length;
  return {
    amount,
    index: plainMatch.index + prefixLength,
    length: plainMatch[1].length,
  };
}

function inferCategory(normalizedText: string): ExpenseCategory {
  if (
    /an sang|an trua|an toi|com|do an|an uong|cafe|ca phe|tra sua|grabfood|shopeefood|nha hang|quan an|pho\b/.test(
      normalizedText,
    )
  )
    return 'food';
  if (
    /do xang|xang|grab|be\b|taxi|gui xe|parking|bus|metro|ve xe/.test(
      normalizedText,
    )
  )
    return 'transport';
  if (
    /mua sam|mua ao|mua quan|shopee|lazada|tiki|sieu thi|cua hang|store|mart/.test(
      normalizedText,
    )
  )
    return 'shopping';
  if (
    /tien dien|tien nuoc|dien luc|evn|internet|wifi|hoa don|dien thoai|nap tien/.test(
      normalizedText,
    )
  )
    return 'bills';
  if (
    /netflix|spotify|xem phim|rap phim|game|steam|youtube/.test(normalizedText)
  )
    return 'entertainment';
  return 'other';
}

function cleanTitle(input: string, amount: AmountMatch) {
  const withoutAmount = `${input.slice(0, amount.index)} ${input.slice(
    amount.index + amount.length,
  )}`;
  const title = withoutAmount
    .replace(/\b(hôm nay|hom nay|hôm qua|hom qua)\b/giu, ' ')
    .replace(/^[\s,;:+-]*(chi|chi tiêu|chi tieu)\s+/iu, '')
    .replace(/[\s,;:+-]+$/gu, '')
    .trim()
    .replace(/\s+/g, ' ');
  if (!title) return '';
  return `${title[0].toLocaleUpperCase('vi-VN')}${title.slice(1)}`;
}

export function parseQuickTransactionText(
  input: string,
): ParsedQuickTransactionText | null {
  const text = input.trim();
  if (!text) return null;
  const amount = findAmount(text);
  if (!amount) return null;
  const title = cleanTitle(text, amount);
  if (!title) return null;
  const normalizedText = normalizeCategoryName(text);
  const isIncome =
    /(^|\s)(thu nhap|nhan tien|tien vao|duoc tra|tien thuong|thuong)(\s|$)/.test(
      normalizedText,
    );
  return {
    amount: amount.amount,
    type: isIncome ? 'income' : 'expense',
    title,
    category: inferCategory(normalizedText),
    date: normalizedText.includes('hom qua')
      ? 'yesterday'
      : normalizedText.includes('hom nay')
        ? 'today'
        : null,
    normalizedText,
  };
}
