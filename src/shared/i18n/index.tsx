import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { vi } from '@/shared/i18n/locales/vi';

const locales = { vi } as const;
export type Locale = keyof typeof locales;
export type Messages = typeof vi;

type TranslationKey<T> = T extends Record<string, unknown>
  ? { [K in keyof T & string]: T[K] extends Record<string, unknown> ? `${K}.${TranslationKey<T[K]>}` : K }[keyof T & string]
  : never;

export type I18nKey = TranslationKey<Messages>;
export type TranslationParams = Record<string, string | number>;

type I18nContextValue = {
  locale: Locale;
  intlLocale: string;
  setLocale: (locale: Locale) => void;
  t: (key: I18nKey, params?: TranslationParams) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function getMessage(locale: Locale, key: I18nKey): string {
  const value = key.split('.').reduce<unknown>((current, part) => {
    if (current && typeof current === 'object' && part in current) {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, locales[locale]);
  if (typeof value !== 'string' && __DEV__) {
    console.warn(`[i18n] Missing translation: ${key}`);
  }
  return typeof value === 'string' ? value : key;
}

function interpolate(message: string, params?: TranslationParams): string {
  if (!params) return message;
  return message.replace(/{{\s*(\w+)\s*}}/g, (_, name: string) => String(params[name] ?? `{{${name}}}`));
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('vi');
  const value = useMemo<I18nContextValue>(() => ({
    locale,
    intlLocale: locale === 'vi' ? 'vi-VN' : 'en-US',
    setLocale,
    t: (key, params) => interpolate(getMessage(locale, key), params),
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}
