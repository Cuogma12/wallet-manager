import initSqlJs from 'sql.js/dist/sql-wasm-browser.js';
import wasmUrl from 'sql.js/dist/sql-wasm-browser.wasm';
import { openSnapshotStore } from '@/db/web/snapshotStore';
import { createWebDatabase } from '@/db/web/sqliteAdapter';

let engine: ReturnType<typeof initSqlJs> | null = null;
export async function openWebDatabase() {
  engine ??= initSqlJs({ locateFile: () => wasmUrl });
  const SQL = await engine;
  const store = await openSnapshotStore();
  try {
    return await createWebDatabase(SQL, store);
  } catch (error) {
    store.close();
    throw error;
  }
}
