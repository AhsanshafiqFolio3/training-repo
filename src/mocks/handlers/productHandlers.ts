import { isCategory, isProductSort, PAGE_SIZE } from '../../api/types'
import type { Product, ProductList, ProductSort } from '../../api/types'
import { findProduct, mockDatabase } from '../mockDatabase'
import { errorResponse, jsonResponse } from '../mockResponses'
import { readMockSettings } from '../mockSettings'
import type { MockRequest } from '../mockRequest'

function compareProducts(sort: ProductSort): (a: Product, b: Product) => number {
  switch (sort) {
    case 'price-asc':
      return (a, b) => a.price - b.price
    case 'price-desc':
      return (a, b) => b.price - a.price
    case 'rating':
      return (a, b) => b.rating - a.rating
    case 'name':
      return (a, b) => a.name.localeCompare(b.name)
    case 'featured':
      return (a, b) => a.id.localeCompare(b.id)
  }
}

function serverError(): Response {
  return errorResponse(500, 'SERVER_ERROR', 'The product service is not responding.')
}

// GET /api/products?search=&category=&sort=&page=&inStock=
export function listProducts({ url }: MockRequest): Response {
  if (readMockSettings().failProductRequests) return serverError()

  const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()
  const category = url.searchParams.get('category')
  const sort = url.searchParams.get('sort')
  const inStockOnly = url.searchParams.get('inStock') === 'true'
  const page = Math.max(1, Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1)

  const matches = mockDatabase.products
    // Search the name and the category, so "coffee" finds every coffee.
    .filter(
      (product) =>
        !search || product.name.toLowerCase().includes(search) || product.category.includes(search),
    )
    .filter((product) => !isCategory(category) || product.category === category)
    .filter((product) => !inStockOnly || product.stock > 0)
    .toSorted(compareProducts(isProductSort(sort) ? sort : 'featured'))

  const start = (page - 1) * PAGE_SIZE
  const body: ProductList = {
    items: matches.slice(start, start + PAGE_SIZE),
    total: matches.length,
  }
  return jsonResponse(200, body)
}

// GET /api/products/:id
export function getProduct({ params }: MockRequest): Response {
  if (readMockSettings().failProductRequests) return serverError()

  const product = findProduct(params.id ?? '')
  if (!product) {
    return errorResponse(404, 'PRODUCT_NOT_FOUND', 'No product has that id.')
  }
  return jsonResponse(200, product)
}
