import { useCallback, useRef } from 'react'
import type { ReactElement } from 'react'
import { getProducts, productListCacheKey } from '../../api/products'
import { PAGE_SIZE } from '../../api/types'
import { ApiErrorView } from '../../shared/api-error-view'
import { AsyncContent } from '../../shared/async-content'
import { EmptyState, LoadingGrid } from '../../shared/status-views'
import { useAsync } from '../../shared/use-async'
import { FilterSidebar } from './filter-sidebar'
import { Pagination } from './pagination'
import { ProductGrid } from './product-grid'
import { ProductToolbar } from './product-toolbar'
import { hasActiveFilters } from './product-filters'
import { useProductFilters } from './use-product-filters'

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
  const [productsState, retry] = useAsync(
    loadProducts,
    productListCacheKey({ search, category, inStock, sort, page }),
  )

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
          <AsyncContent
            state={productsState}
            loading={<LoadingGrid label="Loading products" />}
            error={(error) => <ApiErrorView error={error} onRetry={retry} />}
            isEmpty={(data) => data.items.length === 0}
            empty={
              <EmptyState
                title="No products match."
                message="Try a different search, or clear the filters."
              >
                {hasActiveFilters(filters) && (
                  <button type="button" className="button dark" onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
              </EmptyState>
            }
          >
            {(data) => (
              <>
                <ProductGrid products={data.items} label="Products" />
                <Pagination
                  page={page}
                  pageCount={Math.ceil(data.total / PAGE_SIZE)}
                  onChange={goToPage}
                />
              </>
            )}
          </AsyncContent>
        </section>
      </div>
    </main>
  )
}
