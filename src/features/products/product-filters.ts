import { isCategory, isProductSort } from '../../api/types'
import type { Category, ProductSort } from '../../api/types'

// The product list's filters. They live in the URL, so a refresh, a copied
// link and the Back button all show the same products.
export type ProductFilters = {
  search: string
  category?: Category
  inStock: boolean
  sort: ProductSort
  page: number
}

export const SORT_LABELS: Record<ProductSort, string> = {
  featured: 'Featured',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  rating: 'Top rated',
  name: 'Name: A to Z',
}

// Anything unexpected in the URL (a typo, an old link) falls back to the default.
export function readFilters(params: URLSearchParams): ProductFilters {
  const category = params.get('category')
  const sort = params.get('sort')
  const page = Number.parseInt(params.get('page') ?? '1', 10)
  return {
    search: params.get('search') ?? '',
    category: isCategory(category) ? category : undefined,
    inStock: params.get('inStock') === 'true',
    sort: isProductSort(sort) ? sort : 'featured',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

export function hasActiveFilters(filters: ProductFilters): boolean {
  return filters.search !== '' || filters.category !== undefined || filters.inStock
}
