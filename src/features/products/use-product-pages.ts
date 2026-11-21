import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ApiRequestError } from '../../api/api-request-error'
import { toApiRequestError } from '../../api/api-request-error'
import { getProducts, productListCacheKey } from '../../api/products'
import type { Product, ProductList } from '../../api/types'
import { readCache, writeCache } from '../../shared/request-cache'
import type { ProductFilters } from './product-filters'

type PagesState = {
  // Which filters these pages belong to. Pages from older filters are never shown.
  queryKey: string
  pages: ProductList[]
  // How many pages the list wants. loadMore() raises it, the effect fetches the gap.
  wantedPages: number
  error: ApiRequestError | null
}

export type ProductPages = {
  items: Product[]
  total: number
  // true until the first page arrives
  isLoading: boolean
  // true while a later page is on its way
  isLoadingMore: boolean
  // true while the server has products we haven't loaded yet
  hasMore: boolean
  error: ApiRequestError | null
  loadMore: () => void
  retry: () => void
}

// Everything loaded for these filters is cached as one list of pages, so coming back
// to the shop shows the same products straight away without asking the server again.
function startState(queryKey: string): PagesState {
  const pages = readCache<ProductList[]>(queryKey) ?? []
  return { queryKey, pages, wantedPages: Math.max(1, pages.length), error: null }
}

// Loads the product list one page at a time: page 1 straight away, then the next
// page whenever loadMore() is called (the list calls it as you scroll down).
export function useProductPages(filters: ProductFilters): ProductPages {
  const { search, category, inStock, sort } = filters
  const queryKey = productListCacheKey({ search, category, inStock, sort })

  const [state, setState] = useState(() => startState(queryKey))

  // New filters: start again from page 1. Setting state while rendering is React's
  // way to reset state when a prop changes; React re-renders before showing anything.
  let current = state
  if (state.queryKey !== queryKey) {
    current = startState(queryKey)
    setState(current)
  }

  const { pages, wantedPages, error } = current
  const nextPage = pages.length + 1
  const shouldFetch = error === null && pages.length < wantedPages

  useEffect(() => {
    if (!shouldFetch) return

    const controller = new AbortController()
    getProducts({ search, category, inStock, sort, page: nextPage }, controller.signal).then(
      (list) => {
        // Aborted means the filters changed or the page closed: drop the reply.
        if (controller.signal.aborted) return
        setState((latest) =>
          latest.queryKey === queryKey && latest.pages.length === nextPage - 1
            ? { ...latest, pages: [...latest.pages, list] }
            : latest,
        )
      },
      (reason: unknown) => {
        if (controller.signal.aborted) return
        setState((latest) =>
          latest.queryKey === queryKey ? { ...latest, error: toApiRequestError(reason) } : latest,
        )
      },
    )
    return () => controller.abort()
  }, [shouldFetch, nextPage, queryKey, search, category, inStock, sort])

  // Save what we have, so a revisit within the cache's lifetime starts from here.
  useEffect(() => {
    if (pages.length > 0 && readCache(queryKey) !== pages) writeCache(queryKey, pages)
  }, [queryKey, pages])

  const total = pages[0]?.total ?? 0
  const items = useMemo(() => pages.flatMap((page) => page.items), [pages])

  // Asks for one more page, unless one is already on its way, it failed,
  // or every product is already here.
  const loadMore = useCallback(() => {
    setState((latest) => {
      const isBusy = latest.error !== null || latest.pages.length < latest.wantedPages
      const loadedCount = latest.pages.reduce((count, page) => count + page.items.length, 0)
      const isComplete = loadedCount >= (latest.pages[0]?.total ?? 0)
      return isBusy || isComplete ? latest : { ...latest, wantedPages: latest.wantedPages + 1 }
    })
  }, [])

  const retry = useCallback(() => {
    setState((latest) => ({ ...latest, error: null }))
  }, [])

  return {
    items,
    total,
    isLoading: pages.length === 0 && error === null,
    isLoadingMore: pages.length > 0 && shouldFetch,
    hasMore: pages.length > 0 && items.length < total,
    error,
    loadMore,
    retry,
  }
}
