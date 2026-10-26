import '@/shared/styles/global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DatabaseProvider } from '@/db/DatabaseProvider';
import { PwaProvider } from '@/context/PwaContext';
import { OfflineBanner } from '@/features/app-settings/components/OfflineBanner';
import { FinanceProvider } from '@/context/FinanceContext';
import { I18nProvider } from '@/shared/i18n';

export default function RootLayout() {
  return (
    <I18nProvider>
      <PwaProvider>
        <OfflineBanner />
        <DatabaseProvider>
          <FinanceProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="add" options={{ presentation: 'modal' }} />
              <Stack.Screen name="connect-accounts" />
              <Stack.Screen
                name="manage-account"
                options={{ gestureEnabled: false }}
              />
              <Stack.Screen name="salary" options={{ gestureEnabled: false }} />
              <Stack.Screen
                name="transaction-detail"
                options={{ gestureEnabled: false }}
              />
              <Stack.Screen
                name="app-settings"
                options={{ gestureEnabled: false }}
              />
            </Stack>
          </FinanceProvider>
        </DatabaseProvider>
      </PwaProvider>
    </I18nProvider>
  );
}
