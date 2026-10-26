import type { Confirmation } from '@/services/dialogs/confirm';

export function confirmAction(options: Confirmation) {
  if (window.confirm(`${options.title}\n\n${options.message}`))
    options.onConfirm();
}
export function showMessage(title: string, message: string) {
  window.alert(`${title}\n\n${message}`);
}
