import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { ArrowUp } from 'lucide-react'

const SHOW_AFTER_PX = 600

export function BackToTopButton(): ReactElement | null {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    function handleScroll(): void {
      setIsVisible(window.scrollY > SHOW_AFTER_PX)
    }
    // passive: we never call preventDefault, so the browser can scroll without waiting for us.
    window.addEventListener('scroll', handleScroll, { passive: true })
    // Cleanup: without this, the listener would keep running after the page closes.
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
