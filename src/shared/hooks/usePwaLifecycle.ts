import type { PwaState } from '@/shared/types/pwa';

/** Native builds already bundle their assets and do not use browser service workers. */
export function usePwaLifecycle(): PwaState {
  return {
    status: 'native',
    updateAvailable: false,
    persisted: false,
    applyUpdate: () => {},
    requestPersistence: async () => {},
  };
}
