import type { ReactElement } from 'react'
import { Headphones, LayoutGrid, Monitor, Watch, Zap } from 'lucide-react'
import { categories } from '../../shared/types'
import type { Category, Product } from '../../shared/types'

type CategoryOption = Category | 'All products'
const categoryIcons = {
  'All products': LayoutGrid,
  Audio: Headphones,
  Workspace: Monitor,
  Wearables: Watch,
  Accessories: Zap,
}
interface FilterPanelProps {
  products: readonly Product[]
  category: CategoryOption
  inStock: boolean
  onCategoryChange: (category: CategoryOption) => void
  onInStockChange: (inStock: boolean) => void
}
export function FilterPanel({
  products,
  category,
  inStock,
  onCategoryChange,
  onInStockChange,
}: FilterPanelProps): ReactElement {
  return (
    <aside className="filters-panel" aria-label="Product filters">
      <div className="section-eyebrow">EXPLORE THE COLLECTION</div>
      <h2>Find your thing.</h2>
      <div className="category-list">
        {(['All products', ...categories] as const).map((item) => {
          const Icon = categoryIcons[item]
          const count =
            item === 'All products'
              ? products.length
              : products.filter((product) => product.category === item).length
          return (
            <button
              key={item}
              className={`category-button ${category === item ? 'active' : ''}`}
              onClick={() => onCategoryChange(item)}
              aria-pressed={category === item}
            >
              <Icon size={17} />
              <span>{item}</span>
              <span className="category-count">{count}</span>
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
            onChange={(event) => onInStockChange(event.target.checked)}
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
  )
}
