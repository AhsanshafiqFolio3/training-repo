import { useCallback, useEffect, useState } from 'react'
import { toApiRequestError } from '../api/api-request-error'
import { readCache, writeCache, invalidateCache } from './request-cache'
import type { RequestState } from './request-state'

type Loader<TData> = (signal: AbortSignal) => Promise<TData>

type SettledResult<TData> = {
  loader: Loader<TData>
  attempt: number
  state: RequestState<TData>
}

const LOADING = { status: 'loading' } as const

// Runs `loader` and tracks its RequestState. A new loader (new id, new filters) starts a
// new request and aborts the old one. With a cacheKey, a fresh cached result is shown
// straight away and no request is sent (see request-cache.ts).
export function useAsync<TData>(
  loader: Loader<TData>,
  cacheKey?: string,
): [RequestState<TData>, () => void] {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<SettledResult<TData> | null>(null)

  useEffect(() => {
    // Data we already have and that is still fresh: nothing to fetch.
    if (cacheKey && readCache<TData>(cacheKey) !== undefined) return

    const controller = new AbortController()
    function settle(state: RequestState<TData>): void {
      // An aborted request belongs to an old loader or an unmounted component.
      if (!controller.signal.aborted) setSettled({ loader, attempt, state })
    }
    loader(controller.signal).then(
      (data) => {
        if (cacheKey && !controller.signal.aborted) writeCache(cacheKey, data)
        settle({ status: 'success', data })
      },
      (error: unknown) => settle({ status: 'error', error: toApiRequestError(error) }),
    )
    return (): void => {
      controller.abort()
    }
  }, [loader, attempt, cacheKey])

  // Retry always goes to the server, even if something is cached.
  const retry = useCallback((): void => {
    if (cacheKey) invalidateCache(cacheKey)
    setAttempt((current) => current + 1)
  }, [cacheKey])

  // Only show a result if it came from the current loader and attempt.
  const isCurrent = settled?.loader === loader && settled.attempt === attempt
  if (isCurrent) return [settled.state, retry]

  const cached = cacheKey ? readCache<TData>(cacheKey) : undefined
  return [cached === undefined ? LOADING : { status: 'success', data: cached }, retry]
}
