import { createContext, useContext, type ReactNode } from 'react';
import { usePwaLifecycle } from '@/shared/hooks/usePwaLifecycle';
import type { PwaState } from '@/shared/types/pwa';

const Context = createContext<PwaState | null>(null);
export function PwaProvider({ children }: { children: ReactNode }) {
  const value = usePwaLifecycle();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function usePwa() {
  const value = useContext(Context);
  if (!value) throw new Error('usePwa requires PwaProvider');
  return value;
}
