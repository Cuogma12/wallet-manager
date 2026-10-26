export type PwaStatus =
  'native' | 'development' | 'installing' | 'ready' | 'unavailable' | 'error';
export type PwaState = {
  status: PwaStatus;
  updateAvailable: boolean;
  persisted: boolean;
  applyUpdate: () => void;
  requestPersistence: () => Promise<void>;
};
