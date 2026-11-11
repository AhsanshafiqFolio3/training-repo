import type { ReactElement } from 'react'
import { AlertCircle, ArrowRight, PackageOpen, RotateCcw } from 'lucide-react'

interface EmptyProps {
  title: string
  message: string
  action?: () => void
  actionLabel?: string
  error?: boolean
}
export function EmptyState({
  title,
  message,
  action,
  actionLabel = 'Try again',
  error = false,
}: EmptyProps): ReactElement {
  return (
    <div className="empty-state" role={error ? 'alert' : 'status'}>
      <div className="empty-icon">
        {error ? <AlertCircle size={28} /> : <PackageOpen size={28} />}
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action && (
        <button className="button dark" onClick={action}>
          {error ? <RotateCcw size={15} /> : <ArrowRight size={15} />} {actionLabel}
        </button>
      )}
    </div>
  )
}
export function LoadingCards(): ReactElement {
  return (
    <div className="product-grid" role="status" aria-label="Loading products">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="skeleton-card" key={index}>
          <div className="skeleton-image shimmer" />
          <div className="skeleton-line shimmer" />
          <div className="skeleton-line short shimmer" />
        </div>
      ))}
    </div>
  )
}
