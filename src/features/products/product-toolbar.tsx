import { useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { Search } from 'lucide-react'
import { isProductSort, PRODUCT_SORTS } from '../../api/types'
import { useDebouncedValue } from '../../shared/use-debounced-value'
import { hasActiveFilters, SORT_LABELS } from './product-filters'
import { useProductFilters } from './use-product-filters'

const SEARCH_DELAY_MS = 300

function SearchField(): ReactElement {
  const { filters, updateFilters } = useProductFilters()
  // What's in the box right now. The URL only gets it once typing pauses.
  const [draft, setDraft] = useState(filters.search)
  const debouncedDraft = useDebouncedValue(draft, SEARCH_DELAY_MS)

  // URL → box: when the URL's search changes from somewhere else (Back button,
  // Clear filters), show it in the box. Adjusting state during render like this is
  // React's recommended way to reset state when a value changes.
  const [lastUrlSearch, setLastUrlSearch] = useState(filters.search)
  if (filters.search !== lastUrlSearch) {
    setLastUrlSearch(filters.search)
    setDraft(filters.search)
  }

  // Box → URL: once typing pauses, save the search (a new history entry, so Back works).
  const urlSearchRef = useRef(filters.search)
  useEffect(() => {
    urlSearchRef.current = filters.search
  })
  useEffect(() => {
    if (debouncedDraft !== urlSearchRef.current) updateFilters({ search: debouncedDraft })
  }, [debouncedDraft, updateFilters])

  return (
    <label className="search-field">
      <Search size={16} aria-hidden="true" />
      <span className="visually-hidden">Search products</span>
      <input
        type="search"
        placeholder="Search ducks, keyboards, coffee…"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
    </label>
  )
}

export function ProductToolbar(): ReactElement {
  const { filters, updateFilters, clearFilters } = useProductFilters()

  return (
    <div className="product-toolbar">
      <SearchField />
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
