import { createContext, useContext, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { AppButton } from '@/shared/components/atoms/AppButton';
import { ScreenContainer } from '@/shared/components/atoms/ScreenContainer';
import { useFinanceStore } from '@/shared/hooks/useFinanceStore';
import { useI18n } from '@/shared/i18n';

const FinanceContext = createContext<
  ReturnType<typeof useFinanceStore> | undefined
>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const value = useFinanceStore();
  const { t } = useI18n();
  return (
    <FinanceContext.Provider value={value}>
      {!value.isReady ? (
        <ScreenContainer>
          <View className="flex-1 items-center justify-center p-xl gap-md">
            <Text className="text-text text-center">
              {t(value.loadError ? 'common.loadFailed' : 'common.loading')}
            </Text>
            {value.loadError && (
              <AppButton label={t('common.retry')} onPress={value.refresh} />
            )}
          </View>
        </ScreenContainer>
      ) : (
        children
      )}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const value = useContext(FinanceContext);
  if (!value) throw new Error('useFinance must be used inside FinanceProvider');
  return value;
}
