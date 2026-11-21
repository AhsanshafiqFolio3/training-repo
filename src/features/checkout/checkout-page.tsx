import { useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { Link, useNavigate } from 'react-router'
import { toApiRequestError } from '../../api/api-request-error'
import type { ApiRequestError } from '../../api/api-request-error'
import { describeError, errorKind, stockLeftOf } from '../../api/error-messages'
import { createOrder } from '../../api/orders'
import { formatPrice } from '../../shared/format-price'
import { invalidateCache } from '../../shared/request-cache'
import { EmptyState, ErrorState } from '../../shared/status-views'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import type { CartLine } from '../cart/cart-slice'
import {
  cartCleared,
  checkoutStarted,
  selectCartLines,
  selectCartTotal,
  selectCheckoutKey,
  stockChecked,
} from '../cart/cart-slice'
import { stockReset } from '../stock/stock-slice'

type OutOfStockProps = {
  lines: CartLine[]
  stockLeft: Record<string, number>
  onUpdateCart: () => void
}

// 409: name each item that ran short, using our own product names from the cart.
function OutOfStockMessage({ lines, stockLeft, onUpdateCart }: OutOfStockProps): ReactElement {
  const shortLines = lines.filter((line) => stockLeft[line.product.id] !== undefined)
  return (
    <div className="status-message is-error" role="alert">
      <h2>Some items just sold out.</h2>
      <ul className="out-of-stock-list">
        {shortLines.map(({ product, quantity }) => {
          const left = stockLeft[product.id] ?? 0
          return (
            <li key={product.id}>
              <strong>{product.name}</strong>:{' '}
              {left === 0 ? 'sold out' : `only ${left} left (you asked for ${quantity})`}
            </li>
          )
        })}
      </ul>
      <button type="button" className="button dark" onClick={onUpdateCart}>
        Update my cart
      </button>
    </div>
  )
}

export function CheckoutPage(): ReactElement {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const lines = useAppSelector(selectCartLines)
  const total = useAppSelector(selectCartTotal)
  const checkoutKey = useAppSelector(selectCheckoutKey)

  const [error, setError] = useState<ApiRequestError | null>(null)
  const [isPlacing, setIsPlacing] = useState(false)
  // Blocks a second click before React has re-rendered the disabled button.
  const isPlacingRef = useRef(false)

  // One idempotency key per cart. It's kept (and saved with the cart) until the cart
  // changes, so every retry of this checkout sends the same key.
  useEffect(() => {
    if (lines.length > 0) dispatch(checkoutStarted())
  }, [dispatch, lines])

  async function placeOrder(): Promise<void> {
    if (isPlacingRef.current || !checkoutKey) return
    isPlacingRef.current = true
    setIsPlacing(true)
    setError(null)

    try {
      const items = lines.map(({ product, quantity }) => ({ productId: product.id, quantity }))
      const order = await createOrder({ items }, checkoutKey)
      dispatch(cartCleared())
      // Stock just changed, so cached product data and earlier live stock are out of date.
      invalidateCache('product')
      dispatch(stockReset())
      void navigate(`/orders/${order.id}`, { replace: true })
    } catch (caught) {
      // A 401 clears the session in the API client; RequireAuth then sends us to login.
      setError(toApiRequestError(caught))
      isPlacingRef.current = false
      setIsPlacing(false)
    }
  }

  if (lines.length === 0) {
    return (
      <main className="page-container narrow-page">
        <title>Checkout · The Bug Bazaar</title>
        <h1>Checkout</h1>
        <EmptyState title="Your cart is empty." message="Add something before checking out.">
          <Link to="/" className="button dark">
            Browse products
          </Link>
        </EmptyState>
      </main>
    )
  }

  const kind = error ? errorKind(error) : null

  return (
    <main className="page-container narrow-page">
      <title>Checkout · The Bug Bazaar</title>
      <h1>Checkout</h1>
      <ul className="checkout-lines" aria-label="Your order">
        {lines.map(({ product, quantity }) => (
          <li key={product.id}>
            <span>
              {product.name} × {quantity}
            </span>
            <strong>{formatPrice(product.price * quantity)}</strong>
          </li>
        ))}
        <li className="checkout-total">
          <span>Total</span>
          <strong>{formatPrice(total)}</strong>
        </li>
      </ul>

      {error && kind === 'out-of-stock' && (
        <OutOfStockMessage
          lines={lines}
          stockLeft={stockLeftOf(error)}
          onUpdateCart={() => {
            dispatch(stockChecked(stockLeftOf(error)))
            setError(null)
          }}
        />
      )}
      {/* Server errors and lost connections: the button below becomes "Try again" and
          resends the same idempotency key, so a retry can't create a second order. */}
      {error && kind !== 'out-of-stock' && kind !== 'signed-out' && (
        <ErrorState title={describeError(error).title} message={describeError(error).message} />
      )}

      <button
        type="button"
        className="button dark full"
        disabled={isPlacing || kind === 'out-of-stock'}
        onClick={() => void placeOrder()}
      >
        {isPlacing
          ? 'Placing your order…'
          : error && kind !== 'out-of-stock'
            ? 'Try again'
            : 'Place order'}
      </button>
      <p className="form-hint">This is a demo store. No payment is taken.</p>
    </main>
  )
}
