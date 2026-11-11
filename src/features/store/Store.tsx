import { useCallback, useState } from 'react'
import type { ReactElement } from 'react'
import { useSearchParams } from 'react-router'
import { ArrowDownWideNarrow, Check, Search, SlidersHorizontal, X } from 'lucide-react'
import { getProducts } from '../../data/api'
import type { Category, Product } from '../../shared/types'
import { useAsync } from '../../shared/useAsync'
import { readDemoMode, withoutParam } from '../../shared/demoMode'
import { EmptyState, LoadingCards } from '../../shared/Feedback'
import { Toast } from '../../shared/Toast'
import { filterProducts, isSortOption, sortOptions, sortProducts } from './logic'
import type { SortOption } from './logic'
import { useCart } from './useCart'
import { Cart } from './Cart'
import { StoreHero } from './StoreHero'
import { FilterPanel } from './FilterPanel'
import { ProductCard } from './ProductCard'

export function Store(): ReactElement {
  const [params, setParams] = useSearchParams()
  const mode = readDemoMode(params.get('state'))
  const loader = useCallback((signal: AbortSignal) => getProducts(mode, signal), [mode])
  const [state, retry] = useAsync(loader)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category | 'All products'>('All products')
  const [inStock, setInStock] = useState(false)
  const [sort, setSort] = useState<SortOption>('featured')
  const [toast, setToast] = useState('')
  const { dispatch, items } = useCart()
  const source = state.status === 'success' ? state.data.data : []
  const visible = sortProducts(filterProducts(source, { search, category, inStock }), sort)
  const hasFilters = search !== '' || category !== 'All products' || inStock
  function clearFilters(): void {
    setSearch('')
    setCategory('All products')
    setInStock(false)
  }
  function retryLoad(): void {
    setParams((current) => withoutParam(current, 'state'), { replace: true })
    retry()
  }
  function add(product: Product): void {
    dispatch({ type: 'add', product })
    setToast(`${product.name} added to your bag.`)
  }
  function quantityInBag(product: Product): number {
    return items.find((item) => item.product.id === product.id)?.quantity ?? 0
  }
  return (
    <main>
      <StoreHero />
      <div className="shop-layout" id="collection">
        <FilterPanel
          products={source}
          category={category}
          inStock={inStock}
          onCategoryChange={setCategory}
          onInStockChange={setInStock}
        />
        <section className="catalog" aria-label="Product collection">
          <div className="catalog-top">
            <div>
              <h2>
                {category === 'All products' ? 'The collection' : category}
                <span>{state.status === 'success' ? visible.length : '—'}</span>
              </h2>
              <p>A few good things, picked with care.</p>
            </div>
            <div className="sort-control">
              <ArrowDownWideNarrow size={14} />
              <select
                aria-label="Sort products"
                value={sort}
                onChange={(event) => {
                  if (isSortOption(event.target.value)) setSort(event.target.value)
                }}
              >
                {Object.entries(sortOptions).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="search-row">
            <div className="search-box">
              <Search size={17} />
              <input
                type="search"
                aria-label="Search products"
                placeholder="Search for your next everyday essential…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button
                  className="icon-button"
                  aria-label="Clear search"
                  onClick={() => setSearch('')}
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <span className="filter-indicator" title="Search, category and stock filters">
              <SlidersHorizontal size={16} />
            </span>
          </div>
          {hasFilters && (
            <div className="active-filters">
              <span>
                {visible.length} {visible.length === 1 ? 'essential' : 'essentials'} found
              </span>
              <button onClick={clearFilters}>
                Clear filters <X size={12} />
              </button>
            </div>
          )}
          {state.status === 'loading' ? (
            <LoadingCards />
          ) : state.status === 'error' ? (
            <EmptyState
              title="A small interruption."
              message={state.message}
              error
              action={retryLoad}
            />
          ) : source.length === 0 ? (
            <EmptyState
              title="Something good is coming."
              message="There are no products in this collection yet."
              action={retryLoad}
              actionLabel="Reload collection"
            />
          ) : visible.length === 0 ? (
            <EmptyState
              title="Nothing here, just yet."
              message="Try a different search or give your filters a little more room."
              action={clearFilters}
              actionLabel="Clear filters"
            />
          ) : (
            <div className="product-grid">
              {visible.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantityInBag={quantityInBag(product)}
                  onAdd={add}
                />
              ))}
            </div>
          )}
          {state.status === 'success' && visible.length > 0 && (
            <p className="collection-end">
              <span />{' '}
              {hasFilters ? `${visible.length} of ${source.length}` : `All ${source.length}`}{' '}
              thoughtfully selected essentials <span />
            </p>
          )}
        </section>
        <Cart />
      </div>
      {toast && (
        <Toast
          message={toast}
          onDismiss={() => setToast('')}
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
