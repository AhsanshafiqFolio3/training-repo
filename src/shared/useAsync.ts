import { useCallback, useEffect, useState } from 'react'
import { toApiRequestError } from '../api/ApiRequestError'
import type { RequestState } from './requestState'

type Loader<TData> = (signal: AbortSignal) => Promise<TData>

type SettledResult<TData> = {
  loader: Loader<TData>
  attempt: number
  state: RequestState<TData>
}

const LOADING = { status: 'loading' } as const

export function useAsync<TData>(loader: Loader<TData>): [RequestState<TData>, () => void] {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<SettledResult<TData> | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    function settle(state: RequestState<TData>): void {
      // An aborted request belongs to an old loader or an unmounted component.
      if (!controller.signal.aborted) setSettled({ loader, attempt, state })
    }
    loader(controller.signal).then(
      (data) => settle({ status: 'success', data }),
      (error: unknown) => settle({ status: 'error', error: toApiRequestError(error) }),
    )
    return (): void => {
      controller.abort()
    }
  }, [loader, attempt])

  const retry = useCallback((): void => {
    setAttempt((current) => current + 1)
  }, [])

  // Only show a result if it came from the current loader and attempt.
  const isCurrent = settled?.loader === loader && settled.attempt === attempt
  return [isCurrent ? settled.state : LOADING, retry]
}
