import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { colors } from '@/shared/constants/theme';

export function ScreenContainer({ children }: { children: React.ReactNode }) {
  return <SafeAreaView edges={['top']} style={styles.container}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
