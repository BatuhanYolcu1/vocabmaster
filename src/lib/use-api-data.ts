'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from './fetcher';

/**
 * Fetches JSON for `url` and refetches when it changes or `reload()` is called.
 * Keeps the previous data while loading (no flashing skeletons on filter changes).
 */
export function useApiData<T>(url: string | null) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<{ key: string | null; data: T | null; error: string | null }>({
    key: null,
    data: null,
    error: null,
  });
  const key = url ? `${url}#${version}` : null;

  useEffect(() => {
    if (!url || !key) return;
    let active = true;
    api<T>(url).then(
      (data) => active && setState({ key, data, error: null }),
      (error) => active && setState((s) => ({ ...s, key, error: errorMessage(error) })),
    );
    return () => {
      active = false;
    };
  }, [url, key]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { data: state.data, error: state.key === key ? state.error : null, loading: state.key !== key, reload };
}
