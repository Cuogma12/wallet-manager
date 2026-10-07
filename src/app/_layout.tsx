import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDbIfNeeded } from '@/db/database';
import { FinanceProvider } from '@/context/FinanceContext';
import { I18nProvider } from '@/shared/i18n';

export default function RootLayout() {
  return (
    <I18nProvider>
      <SQLiteProvider databaseName="monee.db" onInit={migrateDbIfNeeded}>
        <FinanceProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="add" options={{ presentation: 'modal' }} />
          <Stack.Screen name="connect-accounts" />
          </Stack>
        </FinanceProvider>
      </SQLiteProvider>
    </I18nProvider>
  );
}
