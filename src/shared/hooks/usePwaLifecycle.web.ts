import { useEffect, useRef, useState } from 'react';
import type { PwaState, PwaStatus } from '@/shared/types/pwa';

export function usePwaLifecycle(): PwaState {
  const [status, setStatus] = useState<PwaStatus>('installing');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [persisted, setPersisted] = useState(false);
  const registration = useRef<ServiceWorkerRegistration | null>(null);
  const reloadRequested = useRef(false);
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    function controllerChanged() {
      if (reloadRequested.current) window.location.reload();
      else setStatus('ready');
    }
    const inspect = () => {
      if (cancelled) return;
      const worker = registration.current;
      setUpdateAvailable(Boolean(worker?.waiting));
      if (worker?.active || navigator.serviceWorker.controller)
        setStatus('ready');
      else if (worker?.installing) setStatus('installing');
      else setStatus('error');
    };
    async function setup() {
      if (__DEV__) {
        setStatus('development');
        return;
      }
      if (!window.isSecureContext || !('serviceWorker' in navigator)) {
        setStatus('unavailable');
        return;
      }
      try {
        registration.current = await navigator.serviceWorker.register(
          '/sw.js',
          { scope: '/', updateViaCache: 'none' },
        );
        if (cancelled) return;
        const worker = registration.current;
        worker.addEventListener('updatefound', () => {
          worker.installing?.addEventListener('statechange', inspect);
        });
        worker.installing?.addEventListener('statechange', inspect);
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          controllerChanged,
        );
        inspect();
        timer = setTimeout(inspect, 30_000);
        if (navigator.storage?.persisted)
          setPersisted(await navigator.storage.persisted());
        void worker.update().catch(() => {
          /* Offline startup must not report a false update error. */
        });
      } catch {
        if (!cancelled) setStatus('error');
      }
    }
    void setup();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      navigator.serviceWorker?.removeEventListener(
        'controllerchange',
        controllerChanged,
      );
    };
  }, []);
  function applyUpdate() {
    if (!registration.current?.waiting) return;
    reloadRequested.current = true;
    registration.current.waiting.postMessage('SKIP_WAITING');
  }
  async function requestPersistence() {
    if (navigator.storage?.persist) {
      try {
        setPersisted(await navigator.storage.persist());
      } catch {
        setPersisted(false);
      }
    }
  }
  return {
    status,
    updateAvailable,
    persisted,
    applyUpdate,
    requestPersistence,
  };
}
