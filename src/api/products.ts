import { apiRequest } from './client'
import type { Product, ProductList, ProductQuery } from './types'

// Turns a query into "search=duck&category=ducks…", leaving out defaults.
// The product list page uses the same function for its own URL, so a page
// link and an API request always describe the same products.
export function toProductSearchParams(query: ProductQuery): URLSearchParams {
  const params = new URLSearchParams()
  if (query.search) params.set('search', query.search)
  if (query.category) params.set('category', query.category)
  if (query.inStock) params.set('inStock', 'true')
  if (query.sort && query.sort !== 'featured') params.set('sort', query.sort)
  if (query.page && query.page > 1) params.set('page', String(query.page))
  return params
}

export function getProducts(query: ProductQuery = {}, signal?: AbortSignal): Promise<ProductList> {
  const search = toProductSearchParams(query).toString()
  return apiRequest<ProductList>(search ? `/products?${search}` : '/products', { signal })
}

export function getProduct(id: string, signal?: AbortSignal): Promise<Product> {
  return apiRequest<Product>(`/products/${encodeURIComponent(id)}`, { signal })
}

// Cache keys for useAsync. Both start with "product", so invalidateCache('product')
// clears every product result at once (we do that after an order changes stock).
export function productListCacheKey(query: ProductQuery): string {
  return `products?${toProductSearchParams(query).toString()}`
}

export function productCacheKey(id: string): string {
  return `product/${id}`
}
