import type { ReactElement } from 'react'
import { Link } from 'react-router'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { formatPrice } from '../../shared/format-price'
import { EmptyState } from '../../shared/status-views'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import type { CartLine } from './cart-slice'
import {
  itemRemoved,
  quantityChanged,
  selectCartCount,
  selectCartLines,
  selectCartTotal,
} from './cart-slice'

function CartLineRow({ line }: { line: CartLine }): ReactElement {
  const dispatch = useAppDispatch()
  const { product, quantity } = line
  const isAtStockLimit = quantity >= product.stock

  function setQuantity(next: number): void {
    // The reducer clamps to 0..stock, so typing 99 becomes the stock and 0 removes the line.
    if (Number.isFinite(next)) dispatch(quantityChanged({ productId: product.id, quantity: next }))
  }

  return (
    <li className="cart-line" data-testid="cart-line">
      <img src={product.imageUrl} alt="" className="cart-line-image" />
      <div className="cart-line-info">
        <Link to={`/products/${product.id}`}>{product.name}</Link>
        <span>{formatPrice(product.price)} each</span>
        {isAtStockLimit && <span className="stock-note">Only {product.stock} in stock</span>}
      </div>
      <div className="quantity-control">
        <button
          type="button"
          aria-label={`Decrease ${product.name}`}
          onClick={() => setQuantity(quantity - 1)}
        >
          <Minus size={14} aria-hidden="true" />
        </button>
        <input
          type="number"
          min={1}
          max={product.stock}
          aria-label={`Quantity for ${product.name}`}
          value={quantity}
          onChange={(event) => setQuantity(event.target.valueAsNumber)}
        />
        <button
          type="button"
          aria-label={`Increase ${product.name}`}
          disabled={isAtStockLimit}
          onClick={() => setQuantity(quantity + 1)}
        >
          <Plus size={14} aria-hidden="true" />
        </button>
      </div>
      <strong className="cart-line-total">{formatPrice(product.price * quantity)}</strong>
      <button
        type="button"
        className="icon-button"
        aria-label={`Remove ${product.name}`}
        onClick={() => dispatch(itemRemoved(product.id))}
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </li>
  )
}

export function CartPage(): ReactElement {
  const lines = useAppSelector(selectCartLines)
  const count = useAppSelector(selectCartCount)
  const total = useAppSelector(selectCartTotal)

  return (
    <main className="page-container">
      <title>Your cart · The Bug Bazaar</title>
      <h1>Your cart</h1>
      {lines.length === 0 ? (
        <EmptyState title="Your cart is empty." message="Every developer needs a rubber duck.">
          <Link to="/" className="button dark">
            Browse products
          </Link>
        </EmptyState>
      ) : (
        <div className="cart-layout">
          <ul className="cart-lines" aria-label="Items in your cart">
            {lines.map((line) => (
              <CartLineRow key={line.product.id} line={line} />
            ))}
          </ul>
          <aside className="cart-summary" aria-label="Order summary">
            <p>
              <span>
                {count} {count === 1 ? 'item' : 'items'}
              </span>
              <strong data-testid="cart-total">{formatPrice(total)}</strong>
            </p>
            <Link to="/checkout" className="button dark full">
              Go to checkout
            </Link>
          </aside>
        </div>
      )}
    </main>
  )
}
