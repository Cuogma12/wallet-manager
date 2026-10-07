import { SafeAreaView } from 'react-native-safe-area-context';

export function ScreenContainer({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      {children}
    </SafeAreaView>
  );
}
