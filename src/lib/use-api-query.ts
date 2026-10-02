import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/lib/auth';

/**
 * One authenticated GET, re-run whenever the screen comes back into focus.
 *
 * Four screens read the API and every one of them wants the same three things —
 * the token, a cancel guard so a slow response cannot land on an unmounted
 * screen, and a `loading` flag to gate the first paint. `today-screen.tsx` wrote that
 * by hand before this existed; it keeps its own copy because it *writes* too and
 * has to hold the result in editable state rather than render it.
 *
 * Focus rather than mount, because these screens stay mounted underneath a push:
 * saving 오늘의 기록 and coming back to 일지 must not show the pre-save numbers.
 */
export type Query<T> = {
  data: T | undefined;
  /** True until the first response settles, then only across a refetch. */
  loading: boolean;
  /** The `ApiError`, if the last attempt failed. `data` keeps its last value. */
  error: unknown;
};

/**
 * Pass `null` to hold off — the query stays idle rather than firing.
 *
 * `refetchOnFocus: false` reads once per mount instead, for data a push-and-pop
 * cannot change — `/api/dna` is fixed at signup, and re-reading it on every
 * tab switch was a wasted request each time.
 */
export function useApiQuery<T>(
  path: string | null,
  { refetchOnFocus = true }: { refetchOnFocus?: boolean } = {},
): Query<T> {
  const { authedRequest } = useAuth();
  const [state, setState] = useState<Query<T>>({
    data: undefined,
    loading: path !== null,
    error: undefined,
  });

  // Same body for both triggers; `authedRequest` carries the token (and signs
  // the user out on a 401), so a token change still re-runs it.
  const run = useCallback(() => {
    if (path === null) return;
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true }));
    (async () => {
      try {
        const data = await authedRequest<T>(path);
        if (!cancelled) setState({ data, loading: false, error: undefined });
      } catch (error) {
        if (!cancelled) setState((prev) => ({ ...prev, loading: false, error }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [path, authedRequest]);

  useFocusEffect(useCallback(() => (refetchOnFocus ? run() : undefined), [refetchOnFocus, run]));
  useEffect(() => (refetchOnFocus ? undefined : run()), [refetchOnFocus, run]);

  return state;
}
