import { MAX_BACKUP_BYTES } from '@/shared/utils/backupValidation';
import { FinanceError } from '@/shared/utils/financeValidation';

export async function saveBackupFile(
  text: string,
  _dialogTitle: string,
): Promise<void> {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  if (blob.size > MAX_BACKUP_BYTES) throw new FinanceError('backupTooLarge');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `monee-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function pickBackupFile(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json,text/plain';
    input.hidden = true;
    document.body.appendChild(input);
    let settled = false;
    let focusTimer: ReturnType<typeof setTimeout>;
    const cleanup = () => {
      clearTimeout(focusTimer);
      window.removeEventListener('focus', onFocus);
      input.remove();
    };
    const cancel = () => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve(null);
      }
    };
    const onFocus = () => {
      focusTimer = setTimeout(() => {
        if (!input.files?.length) cancel();
      }, 1000);
    };
    input.addEventListener('cancel', cancel, { once: true });
    input.addEventListener(
      'change',
      () => {
        if (settled) return;
        settled = true;
        const file = input.files?.[0];
        cleanup();
        if (!file) {
          resolve(null);
          return;
        }
        if (file.size > MAX_BACKUP_BYTES) {
          reject(new FinanceError('backupTooLarge'));
          return;
        }
        file
          .text()
          .then(resolve, () => reject(new FinanceError('backupFileFailed')));
      },
      { once: true },
    );
    window.addEventListener('focus', onFocus);
    input.click();
  });
}
