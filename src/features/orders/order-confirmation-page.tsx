import { useCallback } from 'react'
import type { ReactElement } from 'react'
import { Link, useParams } from 'react-router'
import { CheckCircle2 } from 'lucide-react'
import { getOrder } from '../../api/orders'
import type { OrderStatus } from '../../api/types'
import { ApiErrorView } from '../../shared/api-error-view'
import { AsyncContent } from '../../shared/async-content'
import { LoadingDetails } from '../../shared/status-views'
import { useAsync } from '../../shared/use-async'

const STATUS_TEXT: Record<OrderStatus, string> = {
  queued: 'Queued: we’ve received it and it’s waiting to be processed.',
  processing: 'Processing: payment and packing are under way.',
  shipped: 'Shipped: it’s on its way to you.',
}

export function OrderConfirmationPage(): ReactElement {
  const { id = '' } = useParams()
  // No cache key: an order's status keeps changing, so we always ask the server.
  const loadOrder = useCallback((signal: AbortSignal) => getOrder(id, signal), [id])
  const [orderState, retry] = useAsync(loadOrder)

  return (
    <main className="page-container narrow-page">
      <title>Order confirmation · The Bug Bazaar</title>
      <AsyncContent
        state={orderState}
        loading={<LoadingDetails label="Loading your order" />}
        error={(error) => (
          <ApiErrorView
            error={error}
            onRetry={retry}
            notFoundTitle="We couldn’t find that order."
          />
        )}
      >
        {(order) => (
          <div className="order-confirmation">
            <CheckCircle2 size={48} aria-hidden="true" />
            <h1>Thanks for your order!</h1>
            <p>
              Order number <strong>{order.id}</strong>
            </p>
            <p className="order-status">{STATUS_TEXT[order.status]}</p>
            <div className="order-actions">
              <button type="button" className="button secondary" onClick={retry}>
                Check status again
              </button>
              <Link to="/" className="button dark">
                Keep shopping
              </Link>
            </div>
          </div>
        )}
      </AsyncContent>
    </main>
  )
}
