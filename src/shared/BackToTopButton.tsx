import { useState } from 'react'
import type { ReactElement } from 'react'
import { ArrowUp } from 'lucide-react'
import { useEventListener } from './useEventListener'

const SHOW_AFTER_PX = 600

export function BackToTopButton(): ReactElement | null {
  const [isVisible, setIsVisible] = useState(false)

  // passive: we never call preventDefault, so the browser can scroll without waiting for us.
  // The hook removes the listener when the page closes.
  useEventListener('scroll', () => setIsVisible(window.scrollY > SHOW_AFTER_PX), {
    passive: true,
  })

  if (!isVisible) return null

  return (
    <button
      type="button"
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <ArrowUp size={16} aria-hidden="true" /> Back to top
    </button>
  )
}
