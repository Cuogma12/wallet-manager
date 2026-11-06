import { LOCAL_PROFILE_ID } from '@/db/constants';
import { createClientId } from '@/db/ids';
import { writeDatabase, type FinanceDatabase } from '@/db/operations';
import type {
  CustomCategory,
  SaveCustomCategory,
} from '@/shared/types/category';
import {
  isBuiltInExpenseCategory,
  MAX_CUSTOM_CATEGORY_NAME_LENGTH,
  normalizeCategoryName,
} from '@/shared/utils/category';
import { FinanceError } from '@/shared/utils/financeValidation';

export function readCustomCategories(db: FinanceDatabase) {
  return db.getAllAsync<CustomCategory>(
    `SELECT id, name, icon FROM custom_categories
     WHERE profile_id = ? AND deleted_at IS NULL ORDER BY normalized_name, id`,
    LOCAL_PROFILE_ID,
  );
}

export async function requireExpenseCategory(
  db: FinanceDatabase,
  category: string,
) {
  if (isBuiltInExpenseCategory(category)) return;
  const custom = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM custom_categories
     WHERE id = ? AND profile_id = ? AND deleted_at IS NULL`,
    category,
    LOCAL_PROFILE_ID,
  );
  if (!custom) throw new FinanceError('invalidCategory');
}

export function saveCustomCategory(
  db: FinanceDatabase,
  input: SaveCustomCategory,
) {
  const name = input.name.trim().replace(/\s+/g, ' ');
  const normalizedName = normalizeCategoryName(name);
  if (!name || name.length > MAX_CUSTOM_CATEGORY_NAME_LENGTH)
    throw new FinanceError('invalidCategoryName');
  return writeDatabase(db, async (tx) => {
    const duplicate = await tx.getFirstAsync<{ id: string }>(
      `SELECT id FROM custom_categories
       WHERE profile_id = ? AND normalized_name = ? AND deleted_at IS NULL`,
      LOCAL_PROFILE_ID,
      normalizedName,
    );
    if (duplicate) throw new FinanceError('categoryExists');
    const id = createClientId('category');
    const timestamp = new Date().toISOString();
    await tx.runAsync(
      `INSERT INTO custom_categories
       (id, profile_id, name, normalized_name, icon, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'tag-outline', ?, ?)`,
      id,
      LOCAL_PROFILE_ID,
      name,
      normalizedName,
      timestamp,
      timestamp,
    );
    return id;
  });
}
