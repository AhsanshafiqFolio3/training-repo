import type { ReactElement } from 'react'
import { CATEGORIES } from '../../api/types'
import type { Category } from '../../api/types'
import { useProductFilters } from './useProductFilters'

const CATEGORY_LABELS: Record<Category, string> = {
  keyboards: 'Keyboards',
  ducks: 'Rubber ducks',
  coffee: 'Coffee',
  stickers: 'Stickers',
}

export function FilterSidebar(): ReactElement {
  const { filters, updateFilters } = useProductFilters()

  return (
    <aside className="filter-sidebar" aria-label="Filters">
      <fieldset>
        <legend>Category</legend>
        <label>
          <input
            type="radio"
            name="category"
            checked={filters.category === undefined}
            onChange={() => updateFilters({ category: undefined })}
          />
          All categories
        </label>
        {CATEGORIES.map((category) => (
          <label key={category}>
            <input
              type="radio"
              name="category"
              checked={filters.category === category}
              onChange={() => updateFilters({ category })}
            />
            {CATEGORY_LABELS[category]}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Availability</legend>
        <label>
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(event) => updateFilters({ inStock: event.target.checked })}
          />
          In stock only
        </label>
      </fieldset>
    </aside>
  )
}
