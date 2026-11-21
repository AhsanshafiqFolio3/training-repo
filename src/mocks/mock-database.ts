import type { OrderLine, Product, User } from '../api/types'
import { seedProducts } from './seed-products'

// In-memory "database" for the mock API. It resets when the page reloads.

export type StoredUser = User & { password: string }

export type StoredOrder = {
  id: string
  userId: string
  items: OrderLine[]
  createdAt: number
  // The Idempotency-Key the order was created with, if any.
  idempotencyKey: string | null
}

export const DEMO_USER: StoredUser = {
  id: 'user-1',
  name: 'Ada Duck',
  email: 'ada@bugbazaar.dev',
  password: 'debug123',
}

export const mockDatabase = {
  products: seedProducts(),
  users: [DEMO_USER],
  orders: [] as StoredOrder[],
  // Every request the mock received, e.g. "GET /api/products?page=2". Handy in tests.
  requestLog: [] as string[],
}

export function findProduct(id: string): Product | undefined {
  return mockDatabase.products.find((product) => product.id === id)
}

// Lets tests start each case from fresh data.
export function resetMockDatabase(): void {
  mockDatabase.products = seedProducts()
  mockDatabase.users = [DEMO_USER]
  mockDatabase.orders = []
  mockDatabase.requestLog = []
}
