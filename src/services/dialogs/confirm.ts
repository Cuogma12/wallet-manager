import { Alert } from 'react-native';

export type Confirmation = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
};
export function confirmAction(options: Confirmation) {
  Alert.alert(options.title, options.message, [
    { text: options.cancelLabel, style: 'cancel' },
    {
      text: options.confirmLabel,
      style: 'destructive',
      onPress: options.onConfirm,
    },
  ]);
}
export function showMessage(title: string, message: string) {
  Alert.alert(title, message);
}
