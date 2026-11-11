import { useCallback, useEffect, useRef } from 'react'

export function useUnmountSignal(): () => AbortSignal | undefined {
  const controller = useRef<AbortController | null>(null)
  useEffect(() => {
    const current = new AbortController()
    controller.current = current
    return (): void => {
      current.abort()
    }
  }, [])
  return useCallback(() => controller.current?.signal, [])
}
