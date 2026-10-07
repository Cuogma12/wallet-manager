import { StyleSheet, View } from 'react-native';
import { colors, radii } from '@/shared/constants/theme';

export function ProgressBar({ progress, color = colors.expense }: { progress: number; color?: string }) {
  return <View style={styles.track}><View style={[styles.fill, { width: `${Math.min(Math.max(progress, 0), 1) * 100}%`, backgroundColor: color }]} /></View>;
}

const styles = StyleSheet.create({
  track: { height: 8, overflow: 'hidden', borderRadius: radii.pill, backgroundColor: colors.surfaceMuted },
  fill: { height: '100%', borderRadius: radii.pill },
});
