import type { ReactElement } from 'react'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { formatPrice } from '../../shared/formatPrice'
import { calculateTotals } from './logic'
import { useCart } from './useCart'

export function Cart(): ReactElement {
  const { items, dispatch } = useCart()
  const totals = calculateTotals(items)

  return (
    <aside className="cart-panel" id="bag" aria-label="Shopping cart">
      <div className="cart-heading">
        <div>
          <ShoppingBag size={19} />
          <h2>Your cart</h2>
        </div>
        <span className="count-bubble">{totals.count}</span>
      </div>
      {items.length === 0 ? (
        <div className="cart-empty">
          <h3>Your cart is empty.</h3>
          <p>Add a rubber duck. Every developer needs one.</p>
        </div>
      ) : (
        <div className="cart-items">
          {items.map(({ product, quantity }) => (
            <div className="cart-item" key={product.id} data-testid="cart-row">
              <div className="cart-thumbnail">
                <img src={product.imageUrl} alt="" />
              </div>
              <div className="cart-item-info">
                <h3>{product.name}</h3>
                <p>{formatPrice(product.price)}</p>
                <div className="quantity">
                  <button
                    aria-label={`Decrease ${product.name}`}
                    onClick={() => dispatch({ type: 'decrement', id: product.id })}
                  >
                    <Minus size={12} />
                  </button>
                  <span aria-label={`Quantity for ${product.name}`}>{quantity}</span>
                  <button
                    aria-label={`Increase ${product.name}`}
                    disabled={quantity >= product.stock}
                    onClick={() => dispatch({ type: 'add', product })}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              <button
                className="remove-item"
                aria-label={`Remove ${product.name}`}
                onClick={() => dispatch({ type: 'remove', id: product.id })}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="cart-summary">
        <div className="cart-total">
          <strong>Total</strong>
          <strong>{formatPrice(totals.total)}</strong>
        </div>
      </div>
    </aside>
  )
}
