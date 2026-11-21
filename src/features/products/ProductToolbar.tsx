import type { ReactElement } from 'react'
import { Search } from 'lucide-react'
import { isProductSort, PRODUCT_SORTS } from '../../api/types'
import { hasActiveFilters, SORT_LABELS } from './productFilters'
import { useProductFilters } from './useProductFilters'

export function ProductToolbar(): ReactElement {
  const { filters, updateFilters, clearFilters } = useProductFilters()

  return (
    <div className="product-toolbar">
      <label className="search-field">
        <Search size={16} aria-hidden="true" />
        <span className="visually-hidden">Search products</span>
        <input
          type="search"
          placeholder="Search ducks, keyboards, coffee…"
          value={filters.search}
          // Typing replaces the history entry, so Back doesn't step through every letter.
          onChange={(event) => updateFilters({ search: event.target.value }, { replace: true })}
        />
      </label>
      <label className="sort-field">
        Sort by
        <select
          value={filters.sort}
          onChange={(event) => {
            if (isProductSort(event.target.value)) updateFilters({ sort: event.target.value })
          }}
        >
          {PRODUCT_SORTS.map((sort) => (
            <option key={sort} value={sort}>
              {SORT_LABELS[sort]}
            </option>
          ))}
        </select>
      </label>
      {hasActiveFilters(filters) && (
        <button type="button" className="button secondary" onClick={clearFilters}>
          Clear filters
        </button>
      )}
    </div>
  )
}
