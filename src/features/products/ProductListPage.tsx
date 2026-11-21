import { useCallback, useRef } from 'react'
import type { ReactElement } from 'react'
import { getProducts } from '../../api/products'
import { PAGE_SIZE } from '../../api/types'
import { EmptyState, LoadingCards } from '../../shared/Feedback'
import { useAsync } from '../../shared/useAsync'
import { Cart } from '../cart/Cart'
import { FilterSidebar } from './FilterSidebar'
import { Pagination } from './Pagination'
import { ProductGrid } from './ProductGrid'
import { ProductToolbar } from './ProductToolbar'
import { hasActiveFilters } from './productFilters'
import { useProductFilters } from './useProductFilters'

const countFormat = new Intl.NumberFormat('en-US')

function resultSummary(page: number, shown: number, total: number): string {
  if (total === 0) return 'No products found'
  const first = (page - 1) * PAGE_SIZE + 1
  return `Showing ${countFormat.format(first)}–${countFormat.format(first + shown - 1)} of ${countFormat.format(total)} products`
}

export function ProductListPage(): ReactElement {
  const { filters, updateFilters, clearFilters } = useProductFilters()
  const { search, category, inStock, sort, page } = filters
  const headingRef = useRef<HTMLHeadingElement>(null)

  // A new loader whenever a filter changes, so useAsync fetches the new results.
  const loadProducts = useCallback(
    (signal: AbortSignal) => getProducts({ search, category, inStock, sort, page }, signal),
    [search, category, inStock, sort, page],
  )
  const [productsState, retry] = useAsync(loadProducts)

  function goToPage(nextPage: number): void {
    updateFilters({ page: nextPage })
    // Move focus (and the scroll position) back to the top of the results.
    headingRef.current?.focus()
  }

  return (
    <main>
      <title>Shop · The Bug Bazaar</title>
      <div className="shop-layout">
        <FilterSidebar />
        <section className="catalog" aria-labelledby="catalog-heading">
          <div className="catalog-top">
            <h1 id="catalog-heading" ref={headingRef} tabIndex={-1}>
              All products
            </h1>
          </div>
          <ProductToolbar />
          <p className="result-count" aria-live="polite">
            {productsState.status === 'success'
              ? resultSummary(page, productsState.data.items.length, productsState.data.total)
              : ' '}
          </p>
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
            <EmptyState
              title="No products match."
              message="Try a different search, or clear the filters."
              action={hasActiveFilters(filters) ? clearFilters : undefined}
              actionLabel="Clear filters"
            />
          ) : (
            <>
              <ProductGrid products={productsState.data.items} label="Products" />
              <Pagination
                page={page}
                pageCount={Math.ceil(productsState.data.total / PAGE_SIZE)}
                onChange={goToPage}
              />
            </>
          )}
        </section>
        <Cart />
      </div>
    </main>
  )
}
