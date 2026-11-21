import type { ReactElement } from 'react'
import type { FeedStatus } from '../../api/stock-feed'

const LABELS: Record<FeedStatus, string> = {
  connecting: 'Connecting to live stock…',
  live: 'Live stock',
  reconnecting: 'Live stock lost. Reconnecting…',
}

// A small badge that says whether stock numbers are live. role="status" makes
// screen readers announce a change (such as losing the connection) without
// interrupting what they're reading.
export function LiveStockStatus({ status }: { status: FeedStatus }): ReactElement {
  return (
    <p className={`live-status live-status-${status}`} role="status">
      <span className="live-dot" aria-hidden="true" />
      {LABELS[status]}
    </p>
  )
}
