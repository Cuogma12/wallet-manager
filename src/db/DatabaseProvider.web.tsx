import { Component, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { DatabaseContext } from '@/context/DatabaseContext';
import { useWebDatabase } from '@/shared/hooks/useWebDatabase';
import { useWebDatabaseSupport } from '@/shared/hooks/useWebDatabaseSupport';
import { ScreenContainer } from '@/shared/components/atoms/ScreenContainer';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { useI18n } from '@/shared/i18n';
import { uiClasses } from '@/shared/styles/classes';

class DatabaseBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function DatabaseNotice({
  loading = false,
  onRetry,
}: {
  loading?: boolean;
  onRetry: () => void;
}) {
  const { t } = useI18n();
  return (
    <ScreenContainer>
      <View className="flex-1 justify-center gap-md p-xl">
        <Text
          accessibilityRole={loading ? 'text' : 'alert'}
          className={uiClasses.fieldLabel}
        >
          {t(loading ? 'common.loading' : 'pwa.storageUnavailable')}
        </Text>
        {!loading && (
          <>
            <Text className={uiClasses.hint}>{t('pwa.storageHelp')}</Text>
            <AppButton label={t('common.retry')} onPress={onRetry} />
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const support = useWebDatabaseSupport();
  if (support.status !== 'ready')
    return (
      <DatabaseNotice
        loading={support.status === 'checking'}
        onRetry={support.reload}
      />
    );
  return (
    <DatabaseBoundary fallback={<DatabaseNotice onRetry={support.reload} />}>
      <BrowserDatabase>{children}</BrowserDatabase>
    </DatabaseBoundary>
  );
}

function BrowserDatabase({ children }: { children: ReactNode }) {
  const state = useWebDatabase();
  const support = useWebDatabaseSupport();
  if (!state.db || state.failed)
    return <DatabaseNotice loading={!state.failed} onRetry={support.reload} />;
  return (
    <DatabaseContext.Provider value={state.db}>
      {children}
    </DatabaseContext.Provider>
  );
}
