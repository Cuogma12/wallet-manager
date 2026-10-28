import {
  assertMonth,
  formatInputDate,
  getMonthKey,
  parseInputDate,
} from '@/shared/utils/financeValidation';

export function getCalendarWeeks(month: string): (string | null)[][] {
  assertMonth(month);
  const [year, monthNumber] = month.split('-').map(Number);
  const first = new Date(year, monthNumber - 1, 1, 12);
  const offset = (first.getDay() + 6) % 7; // Monday first.
  const length = new Date(year, monthNumber, 0, 12).getDate();
  const count = Math.ceil((offset + length) / 7) * 7;
  const cells = Array.from({ length: count }, (_, index) => {
    const day = index - offset + 1;
    return day < 1 || day > length
      ? null
      : formatInputDate(new Date(year, monthNumber - 1, day, 12));
  });
  return Array.from({ length: count / 7 }, (_, index) =>
    cells.slice(index * 7, index * 7 + 7),
  );
}

export function getCalendarMonth(value: string, now = new Date()): string {
  try {
    return getMonthKey(new Date(parseInputDate(value)));
  } catch {
    return getMonthKey(now);
  }
}

/** Keep the real save instant for today; other selected days use local noon. */
export function resolveTransactionDate(
  value: string,
  now = new Date(),
): string {
  const selected = parseInputDate(value);
  return value.trim() === formatInputDate(now) ? now.toISOString() : selected;
}
