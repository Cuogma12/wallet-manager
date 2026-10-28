import type { Budget } from '@/shared/types/budget';
import type { Transaction } from '@/shared/types/finance';
import { assertMonth, getMonthKey } from '@/shared/utils/financeValidation';

export type BudgetUsage = {
  budget: Budget;
  spent: bigint;
  remaining: bigint;
  percent: string;
  progress: number;
  status: 'normal' | 'near' | 'exhausted' | 'over';
};

function usage(spent: bigint, limit: bigint) {
  return {
    spent,
    remaining: limit - spent,
    percent: limit ? ((spent * 100n + limit / 2n) / limit).toString() : '0',
    progress: limit
      ? Number(spent < limit ? (spent * 10000n) / limit : 10000n) / 10000
      : 0,
    status: !limit
      ? ('normal' as const)
      : spent > limit
        ? ('over' as const)
        : spent === limit
          ? ('exhausted' as const)
          : spent * 100n >= limit * 80n
            ? ('near' as const)
            : ('normal' as const),
  };
}

/** Actual, active expenses across all wallets; no income, transfers or demo rows. */
export function summarizeBudgets(
  budgets: Budget[],
  transactions: Transaction[],
  month: string,
) {
  assertMonth(month);
  const selected = budgets.filter((budget) => budget.month === month);
  const expenses = new Map<string, bigint>();
  for (const tx of transactions) {
    if (
      tx.type !== 'expense' ||
      tx.isDemo ||
      getMonthKey(new Date(tx.occurredAt)) !== month
    )
      continue;
    expenses.set(
      tx.category,
      (expenses.get(tx.category) ?? 0n) + BigInt(tx.amount),
    );
  }
  const items: BudgetUsage[] = selected.map((budget) => ({
    budget,
    ...usage(expenses.get(budget.category) ?? 0n, BigInt(budget.limit)),
  }));
  const limit = items.reduce(
    (sum, item) => sum + BigInt(item.budget.limit),
    0n,
  );
  const spent = items.reduce((sum, item) => sum + item.spent, 0n);
  const categories = new Set(selected.map((budget) => budget.category));
  const unbudgeted = [...expenses].reduce(
    (sum, [category, amount]) => sum + (categories.has(category) ? 0n : amount),
    0n,
  );
  return {
    items,
    limit,
    unbudgeted,
    ...usage(spent, limit),
    alerts: items.filter((item) => item.status !== 'normal').length,
  };
}
