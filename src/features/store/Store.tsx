import { useCallback, useState } from 'react'
import type { ReactElement } from 'react'
import { Check } from 'lucide-react'
import { getProducts } from '../../api/products'
import type { Product } from '../../api/types'
import { EmptyState, LoadingCards } from '../../shared/Feedback'
import { Toast } from '../../shared/Toast'
import { useAsync } from '../../shared/useAsync'
import { Cart } from './Cart'
import { ProductCard } from './ProductCard'
import { useCart } from './useCart'

export function Store(): ReactElement {
  const loadProducts = useCallback((signal: AbortSignal) => getProducts({}, signal), [])
  const [productsState, retry] = useAsync(loadProducts)
  const [toastMessage, setToastMessage] = useState('')
  const { items, dispatch } = useCart()

  function addToCart(product: Product): void {
    dispatch({ type: 'add', product })
    setToastMessage(`${product.name} added to your cart.`)
  }

  function quantityInCart(product: Product): number {
    return items.find((item) => item.product.id === product.id)?.quantity ?? 0
  }

  return (
    <main>
      <div className="shop-layout" id="collection">
        <section className="catalog" aria-label="Products">
          <div className="catalog-top">
            <h2>
              All products
              {productsState.status === 'success' && <span>{productsState.data.total}</span>}
            </h2>
          </div>
          {productsState.status === 'loading' || productsState.status === 'idle' ? (
            <LoadingCards />
          ) : productsState.status === 'error' ? (
            <EmptyState
              title="We couldn’t load the products."
              message="Something went wrong on our side. Please try again."
              error
              action={retry}
            />
          ) : productsState.data.items.length === 0 ? (
            <EmptyState title="No products yet." message="Check back soon." />
          ) : (
            <div className="product-grid">
              {productsState.data.items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantityInCart={quantityInCart(product)}
                  onAdd={addToCart}
                />
              ))}
            </div>
          )}
        </section>
        <Cart />
      </div>
      {toastMessage && (
        <Toast
          message={toastMessage}
          onDismiss={() => setToastMessage('')}
          icon={
            <span className="toast-check">
              <Check size={13} />
            </span>
          }
        />
      )}
    </main>
  )
}
