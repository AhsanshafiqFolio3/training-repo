import { apiRequest } from './client'
import type { Product, ProductList, ProductQuery } from './types'

function toSearchParams(query: ProductQuery): string {
  const params = new URLSearchParams()
  if (query.search) params.set('search', query.search)
  if (query.category) params.set('category', query.category)
  if (query.sort) params.set('sort', query.sort)
  if (query.page && query.page > 1) params.set('page', String(query.page))
  if (query.inStock) params.set('inStock', 'true')
  return params.toString()
}

export function getProducts(query: ProductQuery = {}, signal?: AbortSignal): Promise<ProductList> {
  const search = toSearchParams(query)
  return apiRequest<ProductList>(search ? `/products?${search}` : '/products', { signal })
}

export function getProduct(id: string, signal?: AbortSignal): Promise<Product> {
  return apiRequest<Product>(`/products/${encodeURIComponent(id)}`, { signal })
}
