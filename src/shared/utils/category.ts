import { expenseCategories } from '@/shared/constants/categories';

export const MAX_CUSTOM_CATEGORY_NAME_LENGTH = 40;

export function normalizeCategoryName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('vi-VN');
}

export function isBuiltInExpenseCategory(key: string) {
  return expenseCategories.some((category) => category.key === key);
}
