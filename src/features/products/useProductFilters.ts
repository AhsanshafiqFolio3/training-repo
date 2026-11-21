import { useCallback, useEffect, useMemo, useRef } from 'react'
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

  // React Router gives setParams a new identity on every URL change. Keeping it in a
  // ref lets updateFilters and clearFilters stay the same function for the component's
  // whole life, so effects that depend on them don't re-run on every navigation.
  const setParamsRef = useRef(setParams)
  useEffect(() => {
    setParamsRef.current = setParams
  })

  const updateFilters = useCallback(
    (changes: Partial<ProductFilters>, { replace = false }: UpdateOptions = {}) => {
      setParamsRef.current(
        // Any filter change starts again from page 1, unless the page itself changed.
        (current) => toProductSearchParams({ ...readFilters(current), page: 1, ...changes }),
        { replace },
      )
    },
    [],
  )

  const clearFilters = useCallback(() => {
    // Keep the sort order: it isn't a filter, it only changes the order.
    setParamsRef.current((current) => toProductSearchParams({ sort: readFilters(current).sort }))
  }, [])

  return { filters, updateFilters, clearFilters }
}
