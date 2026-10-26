import { Platform, type ScrollViewProps } from 'react-native';

// RN Web 0.21 treats any scroll (including browser focus scrolling) as a drag
// and blurs the input. Let the browser manage focus; keep drag dismissal native.
export const inputScrollProps = {
  keyboardShouldPersistTaps: 'handled',
  keyboardDismissMode: Platform.OS === 'web' ? 'none' : 'on-drag',
} satisfies Pick<
  ScrollViewProps,
  'keyboardShouldPersistTaps' | 'keyboardDismissMode'
>;
