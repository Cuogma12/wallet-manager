import { useState } from 'react';
import { useDatabase } from '@/context/DatabaseContext';
import { useFinance } from '@/context/FinanceContext';
import { usePwa } from '@/context/PwaContext';
import {
  exportBackup,
  restoreBackup,
} from '@/db/repositories/backupRepository';
import { pickBackupFile, saveBackupFile } from '@/services/backup/backupFile';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';
import { useFormNavigation } from '@/shared/hooks/useFormNavigation';
import { useI18n } from '@/shared/i18n';
import type { FinanceBackup } from '@/shared/types/backup';
import {
  MAX_BACKUP_BYTES,
  parseBackupText,
} from '@/shared/utils/backupValidation';
import { FinanceError } from '@/shared/utils/financeValidation';

export function useAppSettings() {
  const db = useDatabase();
  const finance = useFinance();
  const pwa = usePwa();
  const { t, intlLocale } = useI18n();
  const action = useAsyncAction();
  const navigation = useFormNavigation();
  const [pending, setPending] = useState<FinanceBackup | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [notice, setNotice] = useState('');
  function exportFile() {
    void action.run(async () => {
      setNotice('');
      const snapshot = await exportBackup(db);
      const text = JSON.stringify(snapshot, null, 2);
      if (text.length > MAX_BACKUP_BYTES)
        throw new FinanceError('backupTooLarge');
      await saveBackupFile(text, t('backup.export'));
      setNotice(t('backup.exportNotice'));
    });
  }
  function chooseFile() {
    void action.run(async () => {
      setNotice('');
      setPending(null);
      setAcknowledged(false);
      const text = await pickBackupFile();
      if (text === null) return;
      setPending(parseBackupText(text));
    });
  }
  function cancelRestore() {
    setPending(null);
    setAcknowledged(false);
  }
  function confirmRestore() {
    if (!pending || !acknowledged) return;
    void action.run(async () => {
      await restoreBackup(db, pending);
      await finance.refresh();
      cancelRestore();
      setNotice(t('backup.restored'));
    });
  }
  function requestPersistence() {
    void action.run(pwa.requestPersistence);
  }
  return {
    ...navigation,
    ...action,
    pwa,
    exportFile,
    chooseFile,
    pending,
    acknowledged,
    setAcknowledged,
    cancelRestore,
    confirmRestore,
    notice,
    requestPersistence,
    backupDate: pending
      ? new Date(pending.createdAt).toLocaleString(intlLocale)
      : '',
    loadError: finance.loadError,
    refresh: finance.refresh,
  };
}
