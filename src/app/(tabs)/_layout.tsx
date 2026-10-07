import { Tabs } from 'expo-router';
import { colors } from '@/shared/constants/theme';
import { AppIcon } from '@/shared/components/atoms/icons/AppIcon';
import { useI18n } from '@/shared/i18n';

export default function TabsLayout() {
  const { t } = useI18n();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginBottom: 4 },
        tabBarStyle: {
          height: 76,
          paddingTop: 8,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('nav.overview'), tabBarIcon: ({ color, size }) => <AppIcon name="view-dashboard-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="transactions" options={{ title: t('nav.transactions'), tabBarIcon: ({ color, size }) => <AppIcon name="swap-horizontal" color={color} size={size} /> }} />
      <Tabs.Screen name="budgets" options={{ title: t('nav.budgets'), tabBarIcon: ({ color, size }) => <AppIcon name="chart-donut" color={color} size={size} /> }} />
      <Tabs.Screen name="accounts" options={{ title: t('nav.accounts'), tabBarIcon: ({ color, size }) => <AppIcon name="wallet-outline" color={color} size={size} /> }} />
    </Tabs>
  );
}
