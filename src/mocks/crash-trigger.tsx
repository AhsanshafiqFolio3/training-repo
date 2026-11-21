import { useEffect, useState } from 'react'
import { CRASH_EVENT } from './mock-settings'

// Throws while rendering when the mock controls ask it to, so the error boundary's
// fallback screen and error logging can be seen on purpose. Mock mode only.
export function CrashTrigger(): null {
  const [shouldCrash, setShouldCrash] = useState(false)

  useEffect(() => {
    function crash(): void {
      setShouldCrash(true)
    }
    window.addEventListener(CRASH_EVENT, crash)
    return () => window.removeEventListener(CRASH_EVENT, crash)
  }, [])

  if (shouldCrash) throw new Error('Test crash from the mock controls')
  return null
}
