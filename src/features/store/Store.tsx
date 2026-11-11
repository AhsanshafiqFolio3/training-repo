import { useCallback, useState } from 'react'
import type { ReactElement } from 'react'
import { useSearchParams } from 'react-router'
import {
  ArrowDownWideNarrow,
  ArrowRight,
  Check,
  Headphones,
  LayoutGrid,
  Monitor,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Truck,
  Watch,
  X,
  Zap,
} from 'lucide-react'
import { getProducts } from '../../data/api'
import { categories } from '../../shared/types'
import type { Category, DemoMode, Product } from '../../shared/types'
import { useAsync } from '../../shared/useAsync'
import { ProductVisual } from '../../shared/ProductVisual'
import { EmptyState, LoadingCards } from '../../shared/Feedback'
import { filterProducts, money } from './logic'
import { useCart } from './CartContext'
import { Cart } from './Cart'

export function readDemoMode(value: string | null): DemoMode {
  return value === 'slow' || value === 'empty' || value === 'error' ? value : 'success'
}
const categoryIcons = {
  'All products': LayoutGrid,
  Audio: Headphones,
  Workspace: Monitor,
  Wearables: Watch,
  Accessories: Zap,
}
export function Store(): ReactElement {
  const [params, setParams] = useSearchParams()
  const mode = readDemoMode(params.get('state'))
  const [retry, setRetry] = useState(0)
  const loader = useCallback(
    (signal: AbortSignal) => {
      void retry
      return getProducts(mode, signal)
    },
    [mode, retry],
  )
  const state = useAsync(loader)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category | 'All products'>('All products')
  const [inStock, setInStock] = useState(false)
  const [sort, setSort] = useState('featured')
  const [toast, setToast] = useState('')
  const { dispatch, items } = useCart()
  const source = state.status === 'success' ? state.data.data : []
  const visible = filterProducts(source, { search, category, inStock }).sort((a, b) =>
    sort === 'price-low'
      ? a.price - b.price
      : sort === 'price-high'
        ? b.price - a.price
        : sort === 'rating'
          ? b.rating - a.rating
          : 0,
  )
  const hasFilters = search !== '' || category !== 'All products' || inStock
  function clearFilters(): void {
    setSearch('')
    setCategory('All products')
    setInStock(false)
  }
  function retryLoad(): void {
    setParams({})
    setRetry((value) => value + 1)
  }
  function add(product: Product): void {
    dispatch({ type: 'add', product })
    setToast(`${product.name} added to your bag.`)
  }
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span /> THE EVERYDAY COLLECTION
          </span>
          <h1>
            Everyday,
            <br />
            <em>considered.</em>
          </h1>
          <p>
            Good design. Useful things. A little more joy.
            <br />
            Discover tech that fits the way you live.
          </p>
          <a className="hero-link" href="#collection">
            Find your everyday <ArrowRight size={18} />
          </a>
        </div>
        <div className="hero-visual">
          <span className="hero-circle" />
          <div className="hero-headphones">
            <ProductVisual product={{ kind: 'headphones', color: '#3c453b' }} />
          </div>
          <div className="hero-speaker">
            <ProductVisual product={{ kind: 'speaker', color: '#bf885d' }} />
          </div>
          <span className="hero-product-label">
            LESS NOISE.
            <br />
            MORE YOU.<span>Studio Wireless — 01</span>
          </span>
          <span className="hero-edition">CURATED WITH PURPOSE / VOL. 01</span>
        </div>
      </section>
      <div className="benefits">
        <span>
          <Truck size={16} /> Free delivery, every order
        </span>
        <span>
          <ShieldCheck size={16} /> Quality you can count on
        </span>
        <span>
          <Sparkles size={16} /> 10% off above Rs. 5,000
        </span>
        <span className="benefits-end">Small details. Big difference.</span>
      </div>
      <div className="shop-layout" id="collection">
        <aside className="filters-panel" aria-label="Product filters">
          <div className="section-eyebrow">EXPLORE THE COLLECTION</div>
          <h2>Find your thing.</h2>
          <div className="category-list">
            {(['All products', ...categories] as const).map((item) => {
              const Icon = categoryIcons[item]
              return (
                <button
                  key={item}
                  className={`category-button ${category === item ? 'active' : ''}`}
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                >
                  <Icon size={17} />
                  <span>{item}</span>
                  <span className="category-count">
                    {item === 'All products'
                      ? source.length
                      : source.filter((product) => product.category === item).length}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="availability">
            <h3>Availability</h3>
            <label className="stock-toggle">
              <span>In stock only</span>
              <input
                type="checkbox"
                checked={inStock}
                onChange={(event) => setInStock(event.target.checked)}
              />
              <span className="toggle-track" />
            </label>
          </div>
          <div className="sidebar-note">
            <span className="note-spark">✳</span>
            <h3>Less, but better.</h3>
            <p>
              Thoughtfully selected.
              <br />
              Made for your everyday.
            </p>
            <span className="note-rule" />
          </div>
        </aside>
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
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="rating">Top rated</option>
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
              {visible.map((product) => {
                const quantity = items.find((item) => item.product.id === product.id)?.quantity ?? 0
                const soldOut = product.stock === 0,
                  atLimit = quantity >= product.stock
                return (
                  <article className="product-card" key={product.id}>
                    <div className="product-image" style={{ background: product.background }}>
                      <div className="product-badges">
                        {product.badge && (
                          <span
                            className={`badge ${product.badge === 'Bestseller' ? 'badge-best' : ''}`}
                          >
                            {product.badge === 'Bestseller' && (
                              <Star size={9} fill="currentColor" />
                            )}
                            {product.badge}
                          </span>
                        )}
                        {soldOut && <span className="badge badge-sold">Back soon</span>}
                      </div>
                      <ProductVisual product={product} />
                      <span className="image-label">FORM / {product.category.toUpperCase()}</span>
                    </div>
                    <div className="product-meta">
                      <span>{product.category}</span>
                      <span className="rating">
                        <Star size={11} fill="currentColor" />
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                    <h3>{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-bottom">
                      <strong>{money(product.price)}</strong>
                      <button
                        className={`add-button ${quantity > 0 ? 'added' : ''}`}
                        disabled={soldOut || atLimit}
                        onClick={() => add(product)}
                        aria-label={`Add ${product.name} to bag`}
                      >
                        {quantity > 0 && !atLimit ? <Check size={14} /> : <Plus size={14} />}{' '}
                        {soldOut
                          ? 'Sold out'
                          : atLimit
                            ? 'Max added'
                            : quantity > 0
                              ? `Add (${quantity})`
                              : 'Add'}
                      </button>
                    </div>
                  </article>
                )
              })}
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
        <div className="toast" role="status">
          <CheckCircleIcon />
          <span>{toast}</span>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setToast('')}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </main>
  )
}
function CheckCircleIcon(): ReactElement {
  return (
    <span className="toast-check">
      <Check size={13} />
    </span>
  )
}
