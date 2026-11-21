import { useEffect, useRef } from 'react'

type ListenerOptions = {
  passive?: boolean
}

// Listens to a window event while the component is mounted and stops when it unmounts.
// The event type decides the event's type, e.g. 'keydown' gives a KeyboardEvent.
export function useEventListener<TType extends keyof WindowEventMap>(
  type: TType,
  handler: (event: WindowEventMap[TType]) => void,
  { passive = false }: ListenerOptions = {},
): void {
  // Keep the latest handler in a ref, so a new handler on every render
  // doesn't remove and re-add the listener each time.
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    function listener(event: WindowEventMap[TType]): void {
      handlerRef.current(event)
    }
    window.addEventListener(type, listener, { passive })
    return () => window.removeEventListener(type, listener)
  }, [type, passive])
}
