import { useCallback } from 'react'
import type { ReactElement } from 'react'
import { getProducts } from '../../api/products'
import { EmptyState, LoadingCards } from '../../shared/Feedback'
import { useAsync } from '../../shared/useAsync'
import { Cart } from '../cart/Cart'
import { ProductGrid } from './ProductGrid'

export function ProductListPage(): ReactElement {
  const loadProducts = useCallback((signal: AbortSignal) => getProducts({}, signal), [])
  const [productsState, retry] = useAsync(loadProducts)

  return (
    <main>
      <title>Shop · The Bug Bazaar</title>
      <div className="shop-layout">
        <section className="catalog" aria-labelledby="catalog-heading">
          <div className="catalog-top">
            <h1 id="catalog-heading">All products</h1>
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
            <ProductGrid products={productsState.data.items} label="Products" />
          )}
        </section>
        <Cart />
      </div>
    </main>
  )
}
