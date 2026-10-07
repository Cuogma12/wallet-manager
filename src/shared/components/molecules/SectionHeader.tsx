import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/shared/constants/theme';

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? <Pressable onPress={onAction}><Text style={styles.action}>{actionLabel}</Text></Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 32, marginBottom: 16 },
  title: { color: colors.text, fontSize: 16, fontWeight: '800' },
  action: { color: colors.primary, fontSize: 12, fontWeight: '800' },
});
