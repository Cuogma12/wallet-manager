import type { Transaction } from '@/shared/types/finance';
import { normalizeCategoryName } from '@/shared/utils/category';

const genericWords = new Set([
  'chi',
  'cho',
  'cua',
  'di',
  'mua',
  'o',
  'tai',
  'thanh',
  'tien',
  'toan',
  'va',
  'voi',
]);

function meaningfulTokens(value: string) {
  return new Set(
    normalizeCategoryName(value)
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length >= 2 && !genericWords.has(token)),
  );
}

function similarity(input: string, candidate: string) {
  const normalizedInput = normalizeCategoryName(input);
  const normalizedCandidate = normalizeCategoryName(candidate);
  if (!normalizedInput || !normalizedCandidate) return 0;
  if (normalizedInput === normalizedCandidate) return 1;

  const inputTokens = meaningfulTokens(normalizedInput);
  const candidateTokens = meaningfulTokens(normalizedCandidate);
  if (!inputTokens.size || !candidateTokens.size) return 0;
  let common = 0;
  inputTokens.forEach((token) => {
    if (candidateTokens.has(token)) common += 1;
  });
  return (2 * common) / (inputTokens.size + candidateTokens.size);
}

export function learnCategoryFromHistory(
  title: string,
  transactions: Transaction[],
  allowedCategories: string[],
) {
  const allowed = new Set(allowedCategories);
  let best: { category: string; confidence: number } | null = null;

  for (const transaction of transactions) {
    if (
      transaction.type !== 'expense' ||
      transaction.isDemo ||
      !transaction.isReviewed ||
      !allowed.has(transaction.category)
    )
      continue;
    const confidence = Math.max(
      similarity(title, transaction.title),
      similarity(title, transaction.merchant),
    );
    if (confidence < 0.5) continue;
    if (!best || confidence > best.confidence)
      best = { category: transaction.category, confidence };
    if (confidence === 1) break;
  }

  return best;
}
