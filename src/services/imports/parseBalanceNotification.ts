import { normalizeCategoryName } from '@/shared/utils/category';

export type ParsedBalanceNotification = {
  amount: number;
  type: 'expense' | 'income';
  title: string;
  merchant: string;
  occurredAt: string;
  category:
    'food' | 'transport' | 'shopping' | 'bills' | 'entertainment' | 'other';
  externalId: string;
  normalizedText: string;
};

export type BalanceNotificationParseResult =
  | { ok: true; value: ParsedBalanceNotification }
  | { ok: false; reason: 'empty' | 'amount' | 'type' };

type AmountCandidate = {
  amount: number;
  sign: string;
  index: number;
  score: number;
};

const amountPattern =
  /([+-]?)\s*(\d{1,3}(?:[.,\s]\d{3})+|\d+)\s*(?:vnd|vn\u0111|\u0111)/giu;

function findAmount(text: string) {
  const candidates: AmountCandidate[] = [];
  for (const match of text.matchAll(amountPattern)) {
    const amount = Number(match[2].replace(/[.,\s]/g, ''));
    if (!Number.isSafeInteger(amount) || amount <= 0) continue;
    const index = match.index ?? 0;
    const context = normalizeCategoryName(
      text.slice(Math.max(0, index - 28), index + match[0].length + 12),
    );
    let score = match[1] ? 4 : 0;
    if (
      /giao dich|gd|so tien|amount|ghi no|ghi co|thanh toan|nhan|chuyen/.test(
        context,
      )
    )
      score += 3;
    if (/so du|sd|balance/.test(context)) score -= 5;
    candidates.push({ amount, sign: match[1], index, score });
  }
  return candidates.sort(
    (left, right) => right.score - left.score || left.index - right.index,
  )[0];
}

function detectType(
  normalizedText: string,
  sign: string,
): 'expense' | 'income' | null {
  if (sign === '-') return 'expense';
  if (sign === '+') return 'income';
  const expense =
    /ghi no|debit|thanh toan|chi tieu|tru tien|rut tien|chuyen di/.test(
      normalizedText,
    );
  const income = /ghi co|credit|nhan tien|cong tien|chuyen den|bao co/.test(
    normalizedText,
  );
  if (expense === income) return null;
  return expense ? 'expense' : 'income';
}

function parseOccurredAt(text: string, now: Date) {
  const dateMatch = /\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b/.exec(text);
  if (!dateMatch) return now.toISOString();
  const [day, month, year] = dateMatch.slice(1).map(Number);
  const nearby = text.slice(
    Math.max(0, (dateMatch.index ?? 0) - 24),
    (dateMatch.index ?? 0) + dateMatch[0].length + 24,
  );
  const timeMatch = /\b([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?\b/.exec(
    nearby,
  );
  const hour = Number(timeMatch?.[1] ?? 12);
  const minute = Number(timeMatch?.[2] ?? 0);
  const second = Number(timeMatch?.[3] ?? 0);
  const parsed = new Date(year, month - 1, day, hour, minute, second);
  if (
    year < 1900 ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  )
    return now.toISOString();
  return parsed.toISOString();
}

function inferCategory(
  normalizedText: string,
): ParsedBalanceNotification['category'] {
  if (
    /grabfood|shopeefood|do an|an uong|nha hang|quan an|cafe|coffee|pho\b/.test(
      normalizedText,
    )
  )
    return 'food';
  if (
    /grab|be\b|taxi|xang|petrol|parking|gui xe|bus|metro/.test(normalizedText)
  )
    return 'transport';
  if (
    /shopee|lazada|tiki|sieu thi|cua hang|store|mart|mua sam/.test(
      normalizedText,
    )
  )
    return 'shopping';
  if (
    /dien luc|evn|nuoc|internet|wifi|hoa don|dien thoai|nap tien/.test(
      normalizedText,
    )
  )
    return 'bills';
  if (/netflix|spotify|cinema|rap phim|game|steam|youtube/.test(normalizedText))
    return 'entertainment';
  return 'other';
}

function extractTitle(text: string, type: 'expense' | 'income') {
  const match =
    /(?:^|[|;\s])(?:n\u1ed9i dung|noi dung|nd|m\u00f4 t\u1ea3|mo ta|merchant|t\u1ea1i|tai)\s*[:=-]?\s*([^|;\n]{2,100})/iu.exec(
      text,
    );
  const extracted = match?.[1]
    ?.replace(/\s+(?:s\u1ed1 d\u01b0|so du|sd|l\u00fac|luc)\s*[:=-]?.*$/iu, '')
    .trim();
  if (extracted) return extracted.slice(0, 100);
  return type === 'income' ? 'Tiền vào tài khoản' : 'Giao dịch ngân hàng';
}

function hashText(text: string, seed: number) {
  let hash = seed >>> 0;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function parseBalanceNotification(
  input: string,
  now = new Date(),
): BalanceNotificationParseResult {
  const text = input.trim().replace(/\s+/g, ' ');
  if (!text) return { ok: false, reason: 'empty' };
  const normalizedText = normalizeCategoryName(text);
  const candidate = findAmount(text);
  if (!candidate) return { ok: false, reason: 'amount' };
  const type = detectType(normalizedText, candidate.sign);
  if (!type) return { ok: false, reason: 'type' };
  const title = extractTitle(text, type);
  return {
    ok: true,
    value: {
      amount: candidate.amount,
      type,
      title,
      merchant: title,
      occurredAt: parseOccurredAt(text, now),
      category: inferCategory(normalizedText),
      externalId: `pasted-${hashText(normalizedText, 2166136261)}${hashText(
        normalizedText,
        2246822507,
      )}`,
      normalizedText,
    },
  };
}
