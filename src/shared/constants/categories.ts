export const expenseCategories = [
  { key: 'food', labelKey: 'categories.food', icon: 'food-outline' },
  { key: 'transport', labelKey: 'categories.transport', icon: 'car-outline' },
  { key: 'shopping', labelKey: 'categories.shopping', icon: 'shopping-outline' },
  { key: 'bills', labelKey: 'categories.bills', icon: 'file-document-outline' },
  { key: 'entertainment', labelKey: 'categories.entertainment', icon: 'play-circle-outline' },
  { key: 'other', labelKey: 'categories.other', icon: 'dots-horizontal-circle-outline' },
] as const;

const categoryIcons: Record<string, string> = {
  salary: 'briefcase-outline',
  food: 'food-outline',
  transport: 'car-outline',
  shopping: 'shopping-outline',
  bills: 'file-document-outline',
  entertainment: 'play-circle-outline',
  other: 'dots-horizontal-circle-outline',
};

export function getCategoryIcon(categoryKey: string) {
  return categoryIcons[categoryKey] ?? categoryIcons.other;
}
