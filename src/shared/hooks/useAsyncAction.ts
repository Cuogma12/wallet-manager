import { useRef, useState } from 'react';
import { useI18n } from '@/shared/i18n';
import { FinanceError } from '@/shared/utils/financeValidation';

export function useAsyncAction() {
  const { t } = useI18n();
  const locked = useRef(false);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState('');
  async function run(action: () => Promise<unknown>, onSuccess?: () => void) {
    if (locked.current) return;
    locked.current = true;
    setSaving(true);
    setError('');
    try {
      await action();
      onSuccess?.();
    } catch (cause) {
      setError(
        t(
          `financeErrors.${cause instanceof FinanceError ? cause.code : 'saveFailed'}`,
        ),
      );
    } finally {
      locked.current = false;
      setSaving(false);
    }
  }
  return { run, isSaving, error };
}
