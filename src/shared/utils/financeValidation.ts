export const financeErrorCodes = [
  'invalidAmount',
  'invalidBalance',
  'nameRequired',
  'titleRequired',
  'accountRequired',
  'accountNotFound',
  'invalidMonth',
  'invalidDate',
  'futureDate',
  'salaryExists',
  'unsupportedTransfer',
  'saveFailed',
] as const;

export type FinanceErrorCode = (typeof financeErrorCodes)[number];

export class FinanceError extends Error {
  constructor(public readonly code: FinanceErrorCode) {
    super(code);
    this.name = 'FinanceError';
  }
}

export function assertMoney(value: number, allowNegative = false) {
  if (!Number.isSafeInteger(value) || (!allowNegative && value <= 0)) {
    throw new FinanceError(allowNegative ? 'invalidBalance' : 'invalidAmount');
  }
}

/** Accept plain integers and Vietnamese thousands separators, never silently round. */
export function parseMoneyInput(value: string): number {
  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed) && !/^-?\d{1,3}(?:[.\s]\d{3})+$/.test(trimmed))
    return NaN;
  return Number(trimmed.replace(/[.\s]/g, ''));
}

export function getMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function assertMonth(month: string) {
  if (
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) ||
    Number(month.slice(0, 4)) < 1900
  ) {
    throw new FinanceError('invalidMonth');
  }
}

export function shiftMonth(month: string, offset: number): string {
  assertMonth(month);
  const [year, number] = month.split('-').map(Number);
  return getMonthKey(new Date(year, number - 1 + offset, 1));
}

export function formatMonth(month: string, locale: string): string {
  assertMonth(month);
  const [year, number] = month.split('-').map(Number);
  return new Date(year, number - 1, 1).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });
}

export function formatInputDate(date = new Date()): string {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

export function parseInputDate(value: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) throw new FinanceError('invalidDate');
  const [, day, month, year] = match.map(Number);
  const date = new Date(year, month - 1, day, 12);
  if (
    year < 1900 ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new FinanceError('invalidDate');
  }
  return date.toISOString();
}
