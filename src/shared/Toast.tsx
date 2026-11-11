import type { ReactElement, ReactNode } from 'react'
import { X } from 'lucide-react'

interface ToastProps {
  message: string
  icon: ReactNode
  onDismiss: () => void
}
export function Toast({ message, icon, onDismiss }: ToastProps): ReactElement {
  return (
    <div className="toast" role="status">
      {icon}
      <span>{message}</span>
      <button className="icon-button" aria-label="Dismiss notification" onClick={onDismiss}>
        <X size={15} />
      </button>
    </div>
  )
}
