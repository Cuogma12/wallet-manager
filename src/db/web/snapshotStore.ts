import { FinanceError } from '@/shared/utils/financeValidation';

export type StoredSnapshot = { revision: number; bytes: Uint8Array };
export type SnapshotStore = {
  load: () => Promise<StoredSnapshot | null>;
  save: (bytes: Uint8Array, expectedRevision: number) => Promise<number>;
  close: () => void;
};

/** A single readwrite transaction compares revisions and commits the new image atomically. */
export function openSnapshotStore(): Promise<SnapshotStore> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('monee-finance', 1);
    let blocked = false;
    request.onupgradeneeded = () => {
      request.result.createObjectStore('snapshots');
    };
    request.onerror = () => reject(new FinanceError('backupFileFailed'));
    request.onblocked = () => {
      blocked = true;
      reject(new FinanceError('backupFileFailed'));
    };
    request.onsuccess = () => {
      const db = request.result;
      if (blocked) {
        db.close();
        return;
      }
      db.onversionchange = () => db.close();
      resolve({
        load: () =>
          new Promise((ok, fail) => {
            const tx = db.transaction('snapshots', 'readonly');
            const query = tx.objectStore('snapshots').get('finance');
            tx.oncomplete = () =>
              ok((query.result as StoredSnapshot | undefined) ?? null);
            tx.onabort = tx.onerror = () =>
              fail(new FinanceError('backupFileFailed'));
          }),
        save: (bytes, expectedRevision) =>
          new Promise((ok, fail) => {
            const tx = db.transaction('snapshots', 'readwrite');
            const store = tx.objectStore('snapshots');
            const query = store.get('finance');
            let conflict = false;
            query.onsuccess = () => {
              const revision =
                (query.result as StoredSnapshot | undefined)?.revision ?? 0;
              if (revision !== expectedRevision) {
                conflict = true;
                tx.abort();
                return;
              }
              store.put({ revision: revision + 1, bytes }, 'finance');
            };
            // A successful put request alone is not a successful commit.
            tx.oncomplete = () => ok(expectedRevision + 1);
            tx.onabort = tx.onerror = () =>
              fail(
                new FinanceError(
                  conflict ? 'webStorageConflict' : 'backupFileFailed',
                ),
              );
          }),
        close: () => db.close(),
      });
    };
  });
}
