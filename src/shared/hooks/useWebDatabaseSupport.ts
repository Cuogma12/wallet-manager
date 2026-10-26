import { useEffect, useState } from 'react';

export function useWebDatabaseSupport() {
  const [status, setStatus] = useState<'checking' | 'ready' | 'unavailable'>(
    'checking',
  );
  useEffect(() => {
    const supported =
      window.isSecureContext &&
      typeof indexedDB !== 'undefined' &&
      typeof WebAssembly !== 'undefined';
    const timer = setTimeout(
      () => setStatus(supported ? 'ready' : 'unavailable'),
      0,
    );
    return () => clearTimeout(timer);
  }, []);
  function reload() {
    window.location.reload();
  }
  return { status, reload };
}
