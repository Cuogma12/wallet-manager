import { useEffect, useState } from 'react';
import { openWebDatabase } from '@/db/web/openDatabase';
import { migrateDbIfNeeded } from '@/db/database';

export function useWebDatabase() {
  const [db, setDatabase] = useState<Awaited<
    ReturnType<typeof openWebDatabase>
  > | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let disposed = false;
    let initializing = true;
    let opened: Awaited<ReturnType<typeof openWebDatabase>> | null = null;
    void (async () => {
      try {
        opened = await openWebDatabase();
        if (disposed) return;
        await migrateDbIfNeeded(opened);
        if (!disposed) setDatabase(opened);
      } catch {
        if (!disposed) setFailed(true);
      } finally {
        initializing = false;
        if (disposed) opened?.close();
      }
    })();
    return () => {
      disposed = true;
      if (!initializing) opened?.close();
    };
  }, []);
  return { db, failed };
}
