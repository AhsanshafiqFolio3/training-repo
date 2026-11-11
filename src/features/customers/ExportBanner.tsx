import type { ReactElement } from 'react'
import { AlertCircle, ArrowDownToLine, CheckCircle2, RotateCcw, X } from 'lucide-react'
import type { ExportStatus } from './useExportJob'

const copy = {
  running: {
    title: 'Getting your customer export ready…',
    detail: 'You can keep exploring while we prepare your file.',
  },
  success: {
    title: 'Your export is ready.',
    detail: 'A CSV snapshot of the customers matching your filters.',
  },
  error: {
    title: 'The export couldn’t be prepared.',
    detail: 'No customer data was changed. Please try again.',
  },
}
interface ExportBannerProps {
  status: Exclude<ExportStatus, 'idle'>
  onDownload: () => void
  onRetry: () => void
  onDismiss: () => void
}
export function ExportBanner({
  status,
  onDownload,
  onRetry,
  onDismiss,
}: ExportBannerProps): ReactElement {
  return (
    <div className={`export-banner ${status}`} role="status">
      <div>
        {status === 'running' && <span className="spinner" />}
        {status === 'error' && <AlertCircle size={20} />}
        {status === 'success' && <CheckCircle2 size={20} />}
        <span>
          <strong>{copy[status].title}</strong>
          <small>{copy[status].detail}</small>
        </span>
      </div>
      {status === 'success' && (
        <button className="button secondary" onClick={onDownload}>
          <ArrowDownToLine size={15} />
          Download CSV
        </button>
      )}
      {status === 'error' && (
        <button className="button secondary" onClick={onRetry}>
          <RotateCcw size={15} />
          Try again
        </button>
      )}
      {status !== 'running' && (
        <button className="icon-button" aria-label="Dismiss export result" onClick={onDismiss}>
          <X size={17} />
        </button>
      )}
    </div>
  )
}
