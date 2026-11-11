import { useCallback, useEffect, useState } from 'react'
import type { LoadState } from './types'

type Loader<T> = (signal: AbortSignal) => Promise<T>
interface Settled<T> {
  loader: Loader<T>
  attempt: number
  state: LoadState<T>
}
const loading = { status: 'loading' } as const

export function useAsync<T>(loader: Loader<T>): [LoadState<T>, () => void] {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled<T> | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    const settle = (state: LoadState<T>): void => {
      if (!controller.signal.aborted) setSettled({ loader, attempt, state })
    }
    loader(controller.signal).then(
      (data) => settle({ status: 'success', data }),
      (error: unknown) =>
        settle({
          status: 'error',
          message: error instanceof Error ? error.message : 'Something went wrong.',
        }),
    )
    return (): void => {
      controller.abort()
    }
  }, [loader, attempt])
  const retry = useCallback((): void => {
    setAttempt((current) => current + 1)
  }, [])
  const isCurrent = settled?.loader === loader && settled.attempt === attempt
  return [isCurrent ? settled.state : loading, retry]
}
