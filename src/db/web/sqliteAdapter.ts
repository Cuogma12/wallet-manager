import type { Database, SqlJsStatic } from 'sql.js';
import type { BindValue, FinanceDatabase } from '@/db/operations';
import type { SnapshotStore } from '@/db/web/snapshotStore';
import { FinanceError } from '@/shared/utils/financeValidation';

/** SQLite executes in WASM; a write is successful only after IndexedDB commits its entire image. */
export async function createWebDatabase(
  SQL: SqlJsStatic,
  store: SnapshotStore,
): Promise<FinanceDatabase & { close: () => void }> {
  const saved = await store.load();
  let revision = saved?.revision ?? 0;
  let database: Database = new SQL.Database(saved?.bytes);
  let inTransaction = false;
  let stale = false;
  let closed = false;
  database.run('PRAGMA foreign_keys = ON');
  function assertOpen() {
    if (stale) throw new FinanceError('webStorageConflict');
    if (closed) throw new FinanceError('backupFileFailed');
  }
  function foreignKeys() {
    return Number(database.exec('PRAGMA foreign_keys')[0]?.values[0]?.[0] ?? 0);
  }
  function snapshot() {
    const foreign = foreignKeys();
    const bytes = database.export();
    // sql.js export reopens the SQLite connection and resets connection-level PRAGMAs.
    database.run(`PRAGMA foreign_keys = ${foreign}`);
    return bytes;
  }
  function restore(bytes: Uint8Array, foreign: number) {
    database.close();
    database = new SQL.Database(bytes);
    database.run(`PRAGMA foreign_keys = ${foreign}`);
  }
  async function persist() {
    try {
      revision = await store.save(snapshot(), revision);
    } catch (error) {
      if (error instanceof FinanceError && error.code === 'webStorageConflict')
        stale = true;
      throw error;
    }
  }
  async function mutate<T>(task: () => T): Promise<T> {
    assertOpen();
    if (inTransaction) return task();
    const foreign = foreignKeys();
    const before = snapshot();
    try {
      const result = task();
      await persist();
      return result;
    } catch (error) {
      restore(before, foreign);
      throw error;
    }
  }
  function query<T>(sql: string, params: BindValue[]): T[] {
    assertOpen();
    const statement = database.prepare(sql);
    try {
      statement.bind(params);
      const results: T[] = [];
      while (statement.step()) results.push(statement.getAsObject() as T);
      return results;
    } finally {
      statement.free();
    }
  }
  const adapter: FinanceDatabase & { close: () => void } = {
    getAllAsync: async <T>(sql: string, ...params: BindValue[]) =>
      query<T>(sql, params),
    getFirstAsync: async <T>(sql: string, ...params: BindValue[]) =>
      query<T>(sql, params)[0] ?? null,
    execAsync: async (sql) => {
      assertOpen();
      const connectionOnly = sql
        .split(';')
        .map((part) => part.trim())
        .filter(Boolean)
        .every((part) =>
          /^PRAGMA\s+(foreign_keys|journal_mode)\s*=/i.test(part),
        );
      if (connectionOnly) {
        database.exec(sql);
        return;
      }
      await mutate(() => database.exec(sql));
    },
    runAsync: async (sql, ...params) =>
      mutate(() => {
        database.run(sql, params);
        const changes = database.getRowsModified();
        const row = query<{ id: number }>(
          'SELECT last_insert_rowid() AS id',
          [],
        )[0];
        return { changes, lastInsertRowId: row?.id ?? 0 };
      }),
    withTransactionAsync: async (task) => {
      assertOpen();
      if (inTransaction) throw new Error('Nested browser database transaction');
      const foreign = foreignKeys();
      const before = snapshot();
      inTransaction = true;
      try {
        database.run('BEGIN');
        await task();
        database.run('COMMIT');
        await persist();
      } catch (error) {
        restore(before, foreign);
        throw error;
      } finally {
        inTransaction = false;
      }
    },
    withExclusiveTransactionAsync: async (task) =>
      adapter.withTransactionAsync(() => task(adapter)),
    close: () => {
      if (!closed) {
        closed = true;
        database.close();
        store.close();
      }
    },
  };
  return adapter;
}
