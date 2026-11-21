// Types for the shared API contract. See docs/api-contract.md.
// Prices are always whole cents, so 1999 means $19.99.

export const CATEGORIES = ['keyboards', 'ducks', 'coffee', 'stickers'] as const
export type Category = (typeof CATEGORIES)[number]

export type Product = {
  id: string
  name: string
  price: number
  category: Category
  stock: number
  rating: number
  imageUrl: string
}

export type ApiError = {
  error: {
    code: string
    message: string
    details?: Record<string, string>
  }
}

// GET /api/products
export const PRODUCT_SORTS = ['featured', 'price-asc', 'price-desc', 'rating', 'name'] as const
export type ProductSort = (typeof PRODUCT_SORTS)[number]

export const PAGE_SIZE = 24

export type ProductQuery = {
  search?: string
  category?: Category
  sort?: ProductSort
  page?: number
  inStock?: boolean
}

export type ProductList = {
  items: Product[]
  total: number
}

// POST /api/login and GET /api/me
export type User = {
  id: string
  name: string
  email: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  user: User
}

// POST /api/orders and GET /api/orders/:id
export type OrderLine = {
  productId: string
  quantity: number
}

export type CreateOrderRequest = {
  items: OrderLine[]
}

export type OrderStatus = 'queued' | 'processing' | 'shipped'

export type Order = {
  id: string
  status: OrderStatus
}

export type CreatedOrder = {
  id: string
  status: 'queued'
}

// WebSocket /api/stock: live stock levels. Not in the original contract; we added it
// for D4-4. See docs/api-contract.md.
export type StockUpdate = {
  productId: string
  stock: number
}

// Client to server: "these are the products I'm showing". Replaces the previous list.
export type StockSubscribeMessage = {
  type: 'subscribe'
  productIds: string[]
}

// Server to client: new stock levels. Sent for every watched product right after a
// subscribe (so a reconnect catches up on what it missed), then whenever stock changes.
export type StockUpdateMessage = {
  type: 'stock'
  updates: StockUpdate[]
}

// Type guards for values read from URLs, where anything can appear.
export function isCategory(value: string | null): value is Category {
  return CATEGORIES.some((category) => category === value)
}

export function isProductSort(value: string | null): value is ProductSort {
  return PRODUCT_SORTS.some((sort) => sort === value)
}
