import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { toProductSearchParams } from '../../api/products'
import { readFilters } from './productFilters'
import type { ProductFilters } from './productFilters'

type UpdateOptions = {
  // true replaces the current history entry instead of adding one.
  replace?: boolean
}

type UseProductFiltersResult = {
  filters: ProductFilters
  updateFilters: (changes: Partial<ProductFilters>, options?: UpdateOptions) => void
  clearFilters: () => void
}

// Reads and writes the product filters in the URL. The list page, the sidebar and
// the toolbar all use this hook, so none of them parse the URL themselves.
export function useProductFilters(): UseProductFiltersResult {
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => readFilters(params), [params])

  const updateFilters = useCallback(
    (changes: Partial<ProductFilters>, { replace = false }: UpdateOptions = {}) => {
      setParams(
        // Any filter change starts again from page 1, unless the page itself changed.
        (current) => toProductSearchParams({ ...readFilters(current), page: 1, ...changes }),
        { replace },
      )
    },
    [setParams],
  )

  const clearFilters = useCallback(() => {
    // Keep the sort order: it isn't a filter, it only changes the order.
    setParams((current) => toProductSearchParams({ sort: readFilters(current).sort }))
  }, [setParams])

  return { filters, updateFilters, clearFilters }
}
