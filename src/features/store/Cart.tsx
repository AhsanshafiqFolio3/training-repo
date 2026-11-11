import { useState } from 'react'
import type { ReactElement } from 'react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  LockKeyhole,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import { ProductVisual } from '../../shared/ProductVisual'
import { Modal } from '../../shared/Modal'
import { calculateTotals, DISCOUNT_RATE, DISCOUNT_THRESHOLD, money } from './logic'
import { useCart } from './CartContext'

export function Cart(): ReactElement {
  const { items, dispatch } = useCart()
  const totals = calculateTotals(items)
  const [checkout, setCheckout] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [processing, setProcessing] = useState(false)
  async function placeOrder(): Promise<void> {
    setProcessing(true)
    await new Promise<void>((resolve) => setTimeout(resolve, 650))
    dispatch({ type: 'clear' })
    setProcessing(false)
    setOrderPlaced(true)
  }
  return (
    <aside className="cart-panel" id="bag" aria-label="Shopping bag">
      <div className="cart-heading">
        <div>
          <ShoppingBag size={19} />
          <h2>Your bag</h2>
        </div>
        <span className="count-bubble">{totals.count}</span>
      </div>
      {items.length === 0 ? (
        <div className="cart-empty">
          <span className="bag-art">
            <ShoppingBag size={36} strokeWidth={1} />
            <span>+</span>
          </span>
          <h3>A little room for something good.</h3>
          <p>
            Your everyday essentials
            <br />
            are just an add away.
          </p>
        </div>
      ) : (
        <div className="cart-items">
          {items.map((item) => (
            <div className="cart-item" key={item.product.id} data-testid="cart-row">
              <div className="cart-thumbnail" style={{ background: item.product.background }}>
                <ProductVisual product={item.product} />
              </div>
              <div className="cart-item-info">
                <h3>{item.product.name}</h3>
                <p>{money(item.product.price)}</p>
                <div className="quantity">
                  <button
                    aria-label={`Decrease ${item.product.name}`}
                    onClick={() => dispatch({ type: 'decrement', id: item.product.id })}
                  >
                    <Minus size={12} />
                  </button>
                  <span aria-label={`Quantity for ${item.product.name}`}>{item.quantity}</span>
                  <button
                    aria-label={`Increase ${item.product.name}`}
                    disabled={item.quantity >= item.product.stock}
                    onClick={() => dispatch({ type: 'add', product: item.product })}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              <button
                className="remove-item"
                aria-label={`Remove ${item.product.name}`}
                onClick={() => dispatch({ type: 'remove', id: item.product.id })}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className={`discount-note ${totals.discount > 0 ? 'unlocked' : ''}`}>
        {totals.discount > 0 ? <Check size={17} /> : <span className="discount-symbol">%</span>}
        <span>
          {totals.discount > 0
            ? 'Your 10% everyday discount is unlocked.'
            : 'A little extra, on us. Get 10% off orders above Rs. 5,000.'}
        </span>
      </div>
      {totals.subtotal > 0 && totals.subtotal <= DISCOUNT_THRESHOLD && (
        <div className="discount-progress" aria-label="Discount progress">
          <div
            style={{ width: `${Math.min(100, (totals.subtotal / DISCOUNT_THRESHOLD) * 100)}%` }}
          />
        </div>
      )}
      <div className="cart-summary">
        <div>
          <span>Subtotal</span>
          <span>{money(totals.subtotal)}</span>
        </div>
        <div>
          <span>Discount {totals.discount > 0 ? `(${DISCOUNT_RATE * 100}%)` : ''}</span>
          <span className={totals.discount > 0 ? 'green' : ''}>
            {totals.discount > 0 ? '−' : ''}
            {money(totals.discount)}
          </span>
        </div>
        <div className="cart-total">
          <strong>Total</strong>
          <strong>{money(totals.total)}</strong>
        </div>
        <p className="tax-note">Tax included. No extra delivery charges.</p>
      </div>
      <button
        className="button checkout-button"
        disabled={items.length === 0}
        onClick={() => {
          setOrderPlaced(false)
          setCheckout(true)
        }}
      >
        Review order <ArrowRight size={17} />
      </button>
      <div className="secure-note">
        <LockKeyhole size={12} /> Demo checkout · no payment collected
      </div>
      {checkout && (
        <Modal
          title={orderPlaced ? 'Good things are on the way.' : 'One last look.'}
          onClose={() => {
            if (!processing) setCheckout(false)
          }}
        >
          {orderPlaced ? (
            <div className="order-success">
              <CheckCircle2 size={48} />
              <p>Your demo order has been placed. Thank you for shopping with Form.</p>
              <button className="button dark" onClick={() => setCheckout(false)}>
                Back to the collection <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <>
              <p className="modal-description">
                This is a simulated order. No payment or delivery details are collected.
              </p>
              <div className="order-lines">
                {items.map((item) => (
                  <div key={item.product.id}>
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <strong>{money(item.product.price * item.quantity)}</strong>
                  </div>
                ))}
                <div className="order-discount">
                  <span>Discount</span>
                  <span>−{money(totals.discount)}</span>
                </div>
                <div className="order-total">
                  <strong>Payable total</strong>
                  <strong>{money(totals.total)}</strong>
                </div>
              </div>
              <button
                className="button dark full"
                disabled={processing}
                onClick={() => {
                  void placeOrder()
                }}
              >
                {processing ? 'Placing your order…' : 'Place demo order'} <ArrowRight size={16} />
              </button>
            </>
          )}
        </Modal>
      )}
    </aside>
  )
}
