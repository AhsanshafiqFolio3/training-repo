import { useEffect, useEffectEvent, useId, useRef } from 'react'
import type { ReactElement, ReactNode, RefObject } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  children: ReactNode
  onClose: () => void
  fallbackFocus?: RefObject<HTMLElement | null>
}
function canReceiveFocus(element: HTMLElement | null): element is HTMLElement {
  return Boolean(element?.isConnected && !element.matches(':disabled'))
}
export function Modal({ title, children, onClose, fallbackFocus }: ModalProps): ReactElement {
  const dialog = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const requestClose = useEffectEvent((): void => {
    onClose()
  })
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const fallback = fallbackFocus?.current ?? null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const getFocusable = (): HTMLElement[] =>
      Array.from(
        dialog.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]',
        ) ?? [],
      )
    const initial =
      dialog.current?.querySelector<HTMLElement>('[data-autofocus]') ??
      getFocusable()[0] ??
      dialog.current
    initial?.focus()
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault()
        requestClose()
        return
      }
      if (event.key !== 'Tab') return
      const items = getFocusable()
      const first = items[0],
        last = items[items.length - 1]
      if (!first || !last) {
        event.preventDefault()
        dialog.current?.focus()
        return
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || !dialog.current?.contains(document.activeElement))
      ) {
        event.preventDefault()
        last.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !dialog.current?.contains(document.activeElement))
      ) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return (): void => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
      if (canReceiveFocus(previous)) previous.focus()
      else if (canReceiveFocus(fallback)) fallback.focus()
    }
  }, [fallbackFocus])
  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={dialog}
      >
        <div className="modal-heading">
          <h2 id={titleId}>{title}</h2>
          <button className="icon-button" aria-label="Close dialog" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
