import { useMemo, useState } from 'react';
import type { AccountType } from '@/shared/types/finance';
import { searchAccountProviders } from '@/shared/utils/accountProviders';

export function useAccountProviderSearch(type: AccountType) {
  const [query, setQuery] = useState('');
  const providers = useMemo(
    () => searchAccountProviders(type, query),
    [type, query],
  );
  return { query, setQuery, providers };
}
