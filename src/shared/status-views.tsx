import type { ReactElement, ReactNode } from 'react'
import { AlertCircle, PackageOpen, RotateCcw } from 'lucide-react'

// The loading, empty and error views used on every page, so they look the same everywhere.

type StatusMessageProps = {
  title: string
  message: string
  isError?: boolean
  children?: ReactNode
}

function StatusMessage({
  title,
  message,
  isError = false,
  children,
}: StatusMessageProps): ReactElement {
  return (
    <div
      className={`status-message ${isError ? 'is-error' : ''}`}
      role={isError ? 'alert' : 'status'}
    >
      <div className="status-icon" aria-hidden="true">
        {isError ? <AlertCircle size={28} /> : <PackageOpen size={28} />}
      </div>
      <h2>{title}</h2>
      <p>{message}</p>
      {children}
    </div>
  )
}

type ErrorStateProps = {
  title: string
  message: string
  onRetry?: () => void
  children?: ReactNode
}

export function ErrorState({ title, message, onRetry, children }: ErrorStateProps): ReactElement {
  return (
    <StatusMessage title={title} message={message} isError>
      {onRetry && (
        <button type="button" className="button dark" onClick={onRetry}>
          <RotateCcw size={15} aria-hidden="true" /> Try again
        </button>
      )}
      {children}
    </StatusMessage>
  )
}

type EmptyStateProps = {
  title: string
  message: string
  children?: ReactNode
}

export function EmptyState({ title, message, children }: EmptyStateProps): ReactElement {
  return (
    <StatusMessage title={title} message={message}>
      {children}
    </StatusMessage>
  )
}

export function LoadingGrid({ label }: { label: string }): ReactElement {
  return (
    <div className="product-grid" role="status" aria-label={label}>
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

export function LoadingDetails({ label }: { label: string }): ReactElement {
  return (
    <div className="product-details-layout" role="status" aria-label={label}>
      <div className="skeleton-image shimmer" />
      <div>
        <div className="skeleton-line shimmer" />
        <div className="skeleton-line short shimmer" />
        <div className="skeleton-line short shimmer" />
      </div>
    </div>
  )
}
