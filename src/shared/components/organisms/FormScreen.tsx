import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { ScreenContainer } from '@/shared/components/atoms/ScreenContainer';
import { IconButton } from '@/shared/components/atoms/IconButton';
import { useI18n } from '@/shared/i18n';
import { uiClasses } from '@/shared/styles/classes';
import { cn } from '@/shared/styles/cn';
import { inputScrollProps } from '@/shared/constants/inputBehavior';

export function FormScreen({
  title,
  onClose,
  children,
  isSaving = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  isSaving?: boolean;
}) {
  const { t } = useI18n();
  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          {...inputScrollProps}
          contentContainerClassName={cn(
            uiClasses.screenContent,
            'gap-lg pb-12',
          )}
        >
          <View className={uiClasses.rowBetween}>
            <IconButton
              name="arrow-left"
              onPress={onClose}
              disabled={isSaving}
              accessibilityLabel={t('common.back')}
            />
            <Text
              accessibilityRole="header"
              className="flex-1 px-sm text-center text-lg font-extrabold text-text"
            >
              {title}
            </Text>
            <View className="w-11" />
          </View>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
