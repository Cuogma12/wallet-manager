import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { MAX_BACKUP_BYTES } from '@/shared/utils/backupValidation';
import { FinanceError } from '@/shared/utils/financeValidation';

export async function saveBackupFile(
  text: string,
  dialogTitle: string,
): Promise<void> {
  if (!(await Sharing.isAvailableAsync()))
    throw new FinanceError('backupFileFailed');
  const file = new File(Paths.cache, `monee-backup-${Date.now()}.json`);
  try {
    file.create();
    file.write(text);
    if (file.size > MAX_BACKUP_BYTES) throw new FinanceError('backupTooLarge');
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      UTI: 'public.json',
      dialogTitle,
    });
  } finally {
    // Only the temporary file created by this operation, never the user's saved copy.
    try {
      if (file.exists) file.delete();
    } catch {
      /* Cleanup must not hide a completed share. */
    }
  }
}

export async function pickBackupFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  const file = new File(asset.uri);
  try {
    if ((asset.size ?? file.size) > MAX_BACKUP_BYTES)
      throw new FinanceError('backupTooLarge');
    return await file.text();
  } finally {
    try {
      if (file.uri.startsWith(Paths.cache.uri) && file.exists) file.delete();
    } catch {
      /* Original document is not modified. */
    }
  }
}
