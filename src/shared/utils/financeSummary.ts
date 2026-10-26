import type { Transaction } from '@/shared/types/finance';
import { assertMonth, getMonthKey } from '@/shared/utils/financeValidation';

export type DailyExpense = { day: string; date: Date; amount: number };

function dayKey(date: Date) {
  return `${getMonthKey(date)}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Cash-flow months follow local receipt dates, not salary periods or UTC date prefixes. */
export function summarizeMonth(
  transactions: Transaction[],
  month: string,
  today = new Date(),
) {
  assertMonth(month);
  const selected = transactions
    .filter((tx) => getMonthKey(new Date(tx.occurredAt)) === month)
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime() ||
        a.id.localeCompare(b.id),
    );
  const income = selected.reduce(
    (sum, tx) => sum + (tx.type === 'income' ? tx.amount : 0),
    0,
  );
  const expense = selected.reduce(
    (sum, tx) => sum + (tx.type === 'expense' ? tx.amount : 0),
    0,
  );
  const [year, number] = month.split('-').map(Number);
  const end =
    getMonthKey(today) === month
      ? today.getDate()
      : new Date(year, number, 0).getDate();
  const byDay = new Map<string, number>();
  for (const tx of selected) {
    if (tx.type !== 'expense') continue;
    const key = dayKey(new Date(tx.occurredAt));
    byDay.set(key, (byDay.get(key) ?? 0) + tx.amount);
  }
  const dailyExpenses: DailyExpense[] = Array.from(
    { length: Math.min(7, end) },
    (_, index) => {
      const date = new Date(year, number - 1, Math.max(1, end - 6) + index, 12);
      const day = dayKey(date);
      return { day, date, amount: byDay.get(day) ?? 0 };
    },
  );
  return {
    income,
    expense,
    net: income - expense,
    transactions: selected,
    dailyExpenses,
  };
}
