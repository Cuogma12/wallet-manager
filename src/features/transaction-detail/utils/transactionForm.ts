import { getCategoryIcon } from '@/shared/constants/categories';
import type { Transaction, UpdateTransaction } from '@/shared/types/finance';
import {
  formatInputDate,
  getMonthKey,
  parseInputDate,
  parseMoneyInput,
} from '@/shared/utils/financeValidation';

export type TransactionFields = {
  type: 'expense' | 'income';
  title: string;
  amount: string;
  date: string;
  category: string;
  accountId: string;
  note: string;
  salaryMonth: string;
};

export function initialTransactionFields(
  transaction?: Transaction,
): TransactionFields {
  return {
    type: transaction?.type === 'income' ? 'income' : 'expense',
    title: transaction?.title ?? '',
    amount: String(transaction?.amount ?? ''),
    date: formatInputDate(
      transaction ? new Date(transaction.occurredAt) : undefined,
    ),
    category: transaction?.category ?? 'other',
    accountId: transaction?.accountId ?? '',
    note: transaction?.note ?? '',
    salaryMonth:
      transaction?.salaryMonth ??
      getMonthKey(transaction ? new Date(transaction.occurredAt) : undefined),
  };
}

export function buildTransactionUpdate(
  transaction: Transaction,
  fields: TransactionFields,
): UpdateTransaction {
  return {
    id: transaction.id,
    accountId: fields.accountId,
    title: fields.title,
    amount: parseMoneyInput(fields.amount),
    type: fields.type,
    category: fields.category,
    categoryIcon: getCategoryIcon(fields.category),
    note: fields.note,
    // A title-only edit must not move an original instant to noon or across a month boundary.
    occurredAt:
      fields.date === formatInputDate(new Date(transaction.occurredAt))
        ? transaction.occurredAt
        : parseInputDate(fields.date),
    salaryMonth: fields.salaryMonth,
  };
}
