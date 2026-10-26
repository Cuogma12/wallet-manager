import { createContext, useContext } from 'react';
import type { FinanceDatabase } from '@/db/operations';

export const DatabaseContext = createContext<FinanceDatabase | null>(null);
export function useDatabase() {
  const db = useContext(DatabaseContext);
  if (!db) throw new Error('useDatabase requires DatabaseProvider');
  return db;
}
