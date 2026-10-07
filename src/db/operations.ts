import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

export type FinanceDatabase = Pick<
  SQLiteDatabase,
  | 'getFirstAsync'
  | 'getAllAsync'
  | 'runAsync'
  | 'execAsync'
  | 'withTransactionAsync'
  | 'withExclusiveTransactionAsync'
>;

const queues = new WeakMap<FinanceDatabase, Promise<unknown>>();

/** All repository reads/writes share a queue, including the web transaction fallback. */
export function serializeDatabase<T>(
  db: FinanceDatabase,
  task: () => Promise<T>,
): Promise<T> {
  const next = (queues.get(db) ?? Promise.resolve()).then(task, task);
  queues.set(
    db,
    next.catch(() => undefined),
  );
  return next;
}

export function writeDatabase<T>(
  db: FinanceDatabase,
  task: (tx: FinanceDatabase) => Promise<T>,
): Promise<T> {
  return serializeDatabase(db, async () => {
    let result!: T;
    if (Platform.OS === 'web') {
      await db.withTransactionAsync(async () => {
        result = await task(db);
      });
    } else {
      await db.withExclusiveTransactionAsync(async (tx) => {
        result = await task(tx);
      });
    }
    return result;
  });
}
