import { LOCAL_PROFILE_ID } from '@/db/constants';
import { createClientId } from '@/db/ids';
import { writeDatabase, type FinanceDatabase } from '@/db/operations';
import { expenseCategories } from '@/shared/constants/categories';
import type { Budget, SaveBudget } from '@/shared/types/budget';
import {
  assertMoney,
  assertMonth,
  FinanceError,
} from '@/shared/utils/financeValidation';

// Caller owns the common serialization queue (loadFinance/exportBackup).
export function readBudgets(db: FinanceDatabase) {
  return db.getAllAsync<Budget>(
    'SELECT id, month, category, limit_amount AS "limit" FROM budgets WHERE profile_id = ? AND deleted_at IS NULL ORDER BY month, category',
    LOCAL_PROFILE_ID,
  );
}

export function saveBudget(db: FinanceDatabase, input: SaveBudget) {
  assertMonth(input.month);
  assertMoney(input.limit);
  if (!expenseCategories.some((category) => category.key === input.category))
    throw new FinanceError('invalidCategory');
  return writeDatabase(db, async (tx) => {
    if (
      input.id &&
      !(await tx.getFirstAsync(
        'SELECT id FROM budgets WHERE id = ? AND profile_id = ? AND deleted_at IS NULL',
        input.id,
        LOCAL_PROFILE_ID,
      ))
    )
      throw new FinanceError('budgetNotFound');
    const duplicate = await tx.getFirstAsync(
      'SELECT id FROM budgets WHERE profile_id = ? AND month = ? AND category = ? AND id != ? AND deleted_at IS NULL',
      LOCAL_PROFILE_ID,
      input.month,
      input.category,
      input.id ?? '',
    );
    if (duplicate) throw new FinanceError('budgetExists');
    const timestamp = new Date().toISOString();
    const id = input.id ?? createClientId('budget');
    if (input.id) {
      await tx.runAsync(
        "UPDATE budgets SET month = ?, category = ?, limit_amount = ?, sync_state = 'pending', updated_at = ? WHERE id = ? AND profile_id = ? AND deleted_at IS NULL",
        input.month,
        input.category,
        input.limit,
        timestamp,
        id,
        LOCAL_PROFILE_ID,
      );
    } else {
      await tx.runAsync(
        'INSERT INTO budgets (id, profile_id, month, category, limit_amount, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        id,
        LOCAL_PROFILE_ID,
        input.month,
        input.category,
        input.limit,
        timestamp,
        timestamp,
      );
    }
    return id;
  });
}

export function deleteBudget(db: FinanceDatabase, id: string) {
  return writeDatabase(db, async (tx) => {
    const timestamp = new Date().toISOString();
    const result = await tx.runAsync(
      "UPDATE budgets SET deleted_at = ?, updated_at = ?, sync_state = 'pending' WHERE id = ? AND profile_id = ? AND deleted_at IS NULL",
      timestamp,
      timestamp,
      id,
      LOCAL_PROFILE_ID,
    );
    if (result.changes !== 1) throw new FinanceError('budgetNotFound');
  });
}
