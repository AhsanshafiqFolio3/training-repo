import { useEffect, useState } from 'react'

// Returns `value`, but only after it has stopped changing for `delayMs`.
// While someone types "duck", this stays at the old value and then jumps to "duck" once.
export function useDebouncedValue<TValue>(value: TValue, delayMs: number): TValue {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs)
    // A new value (or unmounting) cancels the pending update and starts over.
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debouncedValue
}
