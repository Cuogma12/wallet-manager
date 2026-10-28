/** Common layout primitives and card variants. Use cn() to add or override utilities. */
export const uiClasses = {
  calendarWeek: 'min-w-[308px] flex-row',
  calendarDay: 'min-h-11 min-w-11 flex-1 items-center justify-center',
  row: 'flex-row items-center',
  rowBetween: 'flex-row items-center justify-between',
  center: 'items-center justify-center',
  card: 'rounded-md bg-surface',
  connectionCard: 'rounded-[18px] bg-surface p-3 shadow-card',
  screenContent: 'p-xl',
  formInput: 'min-h-[52px] rounded-md bg-surface px-md text-base text-text',
  inputBase: 'min-w-0 w-full max-w-full text-base text-text',
  amountInput: 'min-h-[52px] flex-1 text-right text-4xl font-extrabold',
  fieldLabel: 'text-sm font-bold text-text',
  hint: 'text-xs leading-5 text-textMuted',
  error: 'text-sm leading-5 text-expense',
  choiceRow:
    'min-h-[52px] flex-row items-center gap-md rounded-md bg-surface p-md',
  institutionLogo: 'h-11 w-16 shrink-0 overflow-hidden rounded-md bg-white p-1',
} as const;
