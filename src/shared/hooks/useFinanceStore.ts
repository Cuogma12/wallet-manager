import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import * as repository from '@/db/repositories/financeRepository';
import type {
  NewSalary,
  NewTransaction,
  SaveAccount,
} from '@/shared/types/finance';

export function useFinanceStore() {
  const db = useSQLiteContext();
  const [data, setData] = useState<
    Awaited<ReturnType<typeof repository.loadFinance>>
  >({ accounts: [], transactions: [], settings: null });
  const [isReady, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const refresh = useCallback(async () => {
    try {
      const snapshot = await repository.loadFinance(db);
      setLoadError(false);
      setData(snapshot);
      setReady(true);
    } catch {
      setLoadError(true);
    }
  }, [db]);
  useEffect(() => {
    const timer = setTimeout(() => {
      void refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);
  const addTransaction = useCallback(
    async (input: NewTransaction) => {
      await repository.addTransaction(db, input);
      await refresh();
    },
    [db, refresh],
  );
  const saveAccount = useCallback(
    async (input: SaveAccount) => {
      const id = await repository.saveAccount(db, input);
      await refresh();
      return id;
    },
    [db, refresh],
  );
  const recordSalary = useCallback(
    async (input: NewSalary) => {
      await repository.recordSalary(db, input);
      await refresh();
    },
    [db, refresh],
  );
  const clearDemoData = useCallback(async () => {
    await repository.clearDemoData(db);
    await refresh();
  }, [db, refresh]);
  const resetFinancialData = useCallback(async () => {
    await repository.resetFinancialData(db);
    await refresh();
  }, [db, refresh]);
  return useMemo(
    () => ({
      ...data,
      isReady,
      loadError,
      refresh,
      addTransaction,
      saveAccount,
      recordSalary,
      clearDemoData,
      resetFinancialData,
    }),
    [
      data,
      isReady,
      loadError,
      refresh,
      addTransaction,
      saveAccount,
      recordSalary,
      clearDemoData,
      resetFinancialData,
    ],
  );
}
