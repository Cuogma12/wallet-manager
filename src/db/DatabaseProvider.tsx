import type { ReactNode } from 'react';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { migrateDbIfNeeded } from '@/db/database';
import { DatabaseContext } from '@/context/DatabaseContext';

function NativeDatabaseContext({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  return (
    <DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>
  );
}

export function DatabaseProvider({ children }: { children: ReactNode }) {
  return (
    <SQLiteProvider databaseName="monee.db" onInit={migrateDbIfNeeded}>
      <NativeDatabaseContext>{children}</NativeDatabaseContext>
    </SQLiteProvider>
  );
}
