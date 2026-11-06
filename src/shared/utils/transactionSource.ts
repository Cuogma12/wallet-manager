import type { Transaction } from '@/shared/types/finance';

type TransactionIdentity = Pick<Transaction, 'source' | 'externalId'>;

/** Local pasted notifications are user-owned records; bank/API imports stay read-only. */
export function isEditableTransactionSource({
  source,
  externalId,
}: TransactionIdentity) {
  return (
    source === 'manual' ||
    (source === 'imported' && externalId?.startsWith('pasted-') === true)
  );
}
