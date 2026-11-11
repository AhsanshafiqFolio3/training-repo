import { useEffect, useRef, useState } from 'react'
import type { LoadState } from './types'

export function useAsync<T>(loader: (signal: AbortSignal) => Promise<T>): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' })
  const generation = useRef(0)
  useEffect(() => {
    const controller = new AbortController()
    const current = ++generation.current
    setState({ status: 'loading' })
    void loader(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted && current === generation.current)
          setState({ status: 'success', data })
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted && current === generation.current)
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Something went wrong.',
          })
      })
    return (): void => {
      controller.abort()
    }
  }, [loader])
  return state
}
