/** Common layout primitives and card variants. Use cn() to add or override utilities. */
export const uiClasses = {
  row: 'flex-row items-center',
  rowBetween: 'flex-row items-center justify-between',
  center: 'items-center justify-center',
  card: 'rounded-md bg-surface',
  connectionCard: 'rounded-[18px] bg-surface p-3 shadow-card',
  screenContent: 'p-xl',
  formInput: 'min-h-[52px] rounded-md bg-surface px-md text-base text-text',
  fieldLabel: 'text-sm font-bold text-text',
  hint: 'text-xs leading-5 text-textMuted',
  error: 'text-sm leading-5 text-expense',
} as const;
