import { useCallback, useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import type { Product } from '../../api/types'
import { ApiErrorView } from '../../shared/api-error-view'
import { AsyncContent } from '../../shared/async-content'
import type { RequestState } from '../../shared/request-state'
import { EmptyState, LoadingGrid } from '../../shared/status-views'
import { FilterSidebar } from './filter-sidebar'
import { ProductToolbar } from './product-toolbar'
import { hasActiveFilters } from './product-filters'
import { useProductFilters } from './use-product-filters'
import { useProductPages } from './use-product-pages'
import type { ProductPages } from './use-product-pages'
import { VirtualProductGrid } from './virtual-product-grid'

const countFormat = new Intl.NumberFormat('en-US')

// The first page decides what the whole list shows: loading, an error, or products.
// A later page that fails only shows a small message under the products.
function firstPageState({ items, isLoading, error }: ProductPages): RequestState<Product[]> {
  if (isLoading) return { status: 'loading' }
  if (error && items.length === 0) return { status: 'error', error }
  return { status: 'success', data: items }
}

type LoadMoreProps = {
  products: ProductPages
}

// A real button, so keyboard and screen reader users can load more on purpose.
// It also loads by itself when it scrolls near the screen (infinite scroll).
function LoadMore({ products }: LoadMoreProps): ReactElement {
  const { total, hasMore, isLoadingMore, error, loadMore, retry } = products
  const [isNearScreen, setIsNearScreen] = useState(false)

  // A ref callback runs when the button appears and its cleanup when it goes away
  // (error, or everything loaded), so we watch exactly the button that's on the page.
  // It reports whether the button is within 800px of the screen, so the next page is
  // usually here before you reach the bottom.
  const watchButton = useCallback((button: HTMLButtonElement | null) => {
    if (!button || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => setIsNearScreen(entries.some((entry) => entry.isIntersecting)),
      { rootMargin: '800px 0px' },
    )
    observer.observe(button)
    return () => {
      observer.disconnect()
      setIsNearScreen(false)
    }
  }, [])

  // Load whenever the button is near and nothing is loading. This runs again when a
  // page finishes, so on a tall screen where the button stays near, pages keep coming.
  useEffect(() => {
    if (isNearScreen && hasMore && !isLoadingMore) loadMore()
  }, [isNearScreen, hasMore, isLoadingMore, loadMore])

  if (error) {
    return (
      <div className="load-more" role="alert">
        <p>The next products didn't load.</p>
        <button type="button" className="button secondary" onClick={retry}>
          Try again
        </button>
      </div>
    )
  }
  if (!hasMore) {
    return <p className="load-more">That's all {countFormat.format(total)} products.</p>
  }
  return (
    <div className="load-more">
      <button
        ref={watchButton}
        type="button"
        className="button secondary"
        disabled={isLoadingMore}
        onClick={loadMore}
      >
        {isLoadingMore ? 'Loading more products…' : 'Load more products'}
      </button>
    </div>
  )
}

export function ProductListPage(): ReactElement {
  const { filters, clearFilters } = useProductFilters()
  const products = useProductPages(filters)
  const { items, total, isLoading, error, retry } = products

  return (
    <main>
      <title>Shop · The Bug Bazaar</title>
      <div className="shop-layout">
        <FilterSidebar />
        <section className="catalog" aria-labelledby="catalog-heading">
          <div className="catalog-top">
            <h1 id="catalog-heading">All products</h1>
          </div>
          <ProductToolbar />
          <p className="result-count" aria-live="polite">
            {isLoading || (error && items.length === 0)
              ? ' '
              : `${countFormat.format(total)} ${total === 1 ? 'product' : 'products'}`}
          </p>
          <AsyncContent
            state={firstPageState(products)}
            loading={<LoadingGrid label="Loading products" />}
            error={(firstError) => <ApiErrorView error={firstError} onRetry={retry} />}
            isEmpty={(data) => data.length === 0}
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
                <VirtualProductGrid products={data} label="Products" />
                <LoadMore products={products} />
              </>
            )}
          </AsyncContent>
        </section>
      </div>
    </main>
  )
}
