import type { CartItem, Product, ProductFilters } from '../../shared/types'

export const DISCOUNT_THRESHOLD = 5000
export const DISCOUNT_RATE = 0.1
export interface CartTotals {
  count: number
  subtotal: number
  discount: number
  total: number
}
export type CartAction =
  | { type: 'add'; product: Product }
  | { type: 'decrement'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'clear' }
export function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  if (action.type === 'clear') return []
  if (action.type === 'remove') return items.filter((item) => item.product.id !== action.id)
  if (action.type === 'decrement')
    return items.flatMap((item) =>
      item.product.id !== action.id
        ? [item]
        : item.quantity > 1
          ? [{ ...item, quantity: item.quantity - 1 }]
          : [],
    )
  const existing = items.find((item) => item.product.id === action.product.id)
  if ((existing?.quantity ?? 0) >= action.product.stock) return items
  if (existing)
    return items.map((item) =>
      item.product.id === action.product.id ? { ...item, quantity: item.quantity + 1 } : item,
    )
  return [...items, { product: action.product, quantity: 1 }]
}
export function calculateTotals(items: readonly CartItem[]): CartTotals {
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal =
    Math.round(items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) * 100) / 100
  const discount =
    subtotal > DISCOUNT_THRESHOLD ? Math.round(subtotal * DISCOUNT_RATE * 100) / 100 : 0
  return { count, subtotal, discount, total: Math.round((subtotal - discount) * 100) / 100 }
}
export function filterProducts(products: readonly Product[], filters: ProductFilters): Product[] {
  const search = filters.search.trim().toLowerCase()
  return products.filter(
    (product) =>
      (!search ||
        `${product.name} ${product.description} ${product.category}`
          .toLowerCase()
          .includes(search)) &&
      (filters.category === 'All products' || product.category === filters.category) &&
      (!filters.inStock || product.stock > 0),
  )
}
export const sortOptions = {
  featured: 'Featured',
  'price-low': 'Price: low to high',
  'price-high': 'Price: high to low',
  rating: 'Top rated',
} as const
export type SortOption = keyof typeof sortOptions
export function isSortOption(value: string): value is SortOption {
  return Object.hasOwn(sortOptions, value)
}
export function sortProducts(products: readonly Product[], sort: SortOption): Product[] {
  if (sort === 'price-low') return products.toSorted((a, b) => a.price - b.price)
  if (sort === 'price-high') return products.toSorted((a, b) => b.price - a.price)
  if (sort === 'rating') return products.toSorted((a, b) => b.rating - a.rating)
  return [...products]
}
export function money(value: number): string {
  return `Rs. ${value.toLocaleString('en-PK', { minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 })}`
}
