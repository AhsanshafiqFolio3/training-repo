import { beforeEach, describe, expect, it } from 'vitest'
import { PAGE_SIZE } from '../api/types'
import type { ApiError, LoginResponse, Product, ProductList } from '../api/types'
import { DEMO_USER, findProduct, resetMockDatabase } from './mockDatabase'
import { mockFetch } from './mockFetch'
import { DEFAULT_MOCK_SETTINGS, saveMockSettings } from './mockSettings'

async function call<TBody>(path: string, init?: RequestInit): Promise<[number, TBody]> {
  const response = await mockFetch(path, init)
  return [response.status, (await response.json()) as TBody]
}

function post(body: unknown, token?: string): RequestInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  return { method: 'POST', headers, body: JSON.stringify(body) }
}

async function signIn(): Promise<string> {
  const [, body] = await call<LoginResponse>(
    '/api/login',
    post({ email: DEMO_USER.email, password: DEMO_USER.password }),
  )
  return body.token
}

function withToken(token: string): RequestInit {
  return { headers: { Authorization: `Bearer ${token}` } }
}

beforeEach(() => {
  sessionStorage.clear()
  saveMockSettings({ ...DEFAULT_MOCK_SETTINGS, latency: 'none' })
  resetMockDatabase()
})

describe('GET /api/products', () => {
  it('returns one page of products and the total match count', async () => {
    const [status, body] = await call<ProductList>('/api/products')
    expect(status).toBe(200)
    expect(body.items).toHaveLength(PAGE_SIZE)
    expect(body.total).toBe(5000)
  })

  it('applies search, category, in-stock filter and sort together', async () => {
    const [, body] = await call<ProductList>(
      '/api/products?search=duck&category=ducks&inStock=true&sort=price-asc',
    )
    expect(body.total).toBeGreaterThan(0)
    for (const product of body.items) {
      expect(product.category).toBe('ducks')
      expect(product.stock).toBeGreaterThan(0)
    }
    const prices = body.items.map((product) => product.price)
    expect(prices).toEqual(prices.toSorted((a, b) => a - b))
  })

  it('answers 500 when product requests are set to fail', async () => {
    saveMockSettings({ ...DEFAULT_MOCK_SETTINGS, latency: 'none', failProductRequests: true })
    const [status, body] = await call<ApiError>('/api/products')
    expect(status).toBe(500)
    expect(body.error.code).toBe('SERVER_ERROR')
  })
})

describe('GET /api/products/:id', () => {
  it('returns the product, or 404 for an unknown id', async () => {
    const [status, product] = await call<Product>('/api/products/prod-0001')
    expect(status).toBe(200)
    expect(product.id).toBe('prod-0001')

    const [missingStatus, missing] = await call<ApiError>('/api/products/prod-9999')
    expect(missingStatus).toBe(404)
    expect(missing.error.code).toBe('PRODUCT_NOT_FOUND')
  })
})

describe('POST /api/login and GET /api/me', () => {
  it('returns a token and user, and the token works for /api/me', async () => {
    const token = await signIn()
    const [status, user] = await call<{ email: string }>('/api/me', withToken(token))
    expect(status).toBe(200)
    expect(user.email).toBe(DEMO_USER.email)
    expect(user).not.toHaveProperty('password')
  })

  it('answers 400 with field errors when fields are missing', async () => {
    const [status, body] = await call<ApiError>('/api/login', post({ email: '' }))
    expect(status).toBe(400)
    expect(body.error.details).toHaveProperty('email')
    expect(body.error.details).toHaveProperty('password')
  })

  it('answers 401 for a wrong password, a missing token and an expired session', async () => {
    const [wrongPassword] = await call(
      '/api/login',
      post({ email: DEMO_USER.email, password: 'nope' }),
    )
    expect(wrongPassword).toBe(401)

    const [noToken] = await call('/api/me')
    expect(noToken).toBe(401)

    const token = await signIn()
    saveMockSettings({ ...DEFAULT_MOCK_SETTINGS, latency: 'none', rejectTokens: true })
    const [expired] = await call('/api/me', withToken(token))
    expect(expired).toBe(401)
  })
})

describe('POST /api/orders and GET /api/orders/:id', () => {
  it('creates a queued order, lowers stock, and can be read back', async () => {
    const token = await signIn()
    const stockBefore = findProduct('prod-0001')?.stock ?? 0
    expect(stockBefore).toBeGreaterThan(0)

    const [status, created] = await call<{ id: string; status: string }>(
      '/api/orders',
      post({ items: [{ productId: 'prod-0001', quantity: 1 }] }, token),
    )
    expect(status).toBe(201)
    expect(created.status).toBe('queued')
    expect(findProduct('prod-0001')?.stock).toBe(stockBefore - 1)

    const [readStatus, order] = await call<{ id: string }>(
      `/api/orders/${created.id}`,
      withToken(token),
    )
    expect(readStatus).toBe(200)
    expect(order.id).toBe(created.id)
  })

  it('answers 400 for an invalid body and 401 without a token', async () => {
    const token = await signIn()
    const [invalid] = await call('/api/orders', post({ items: [] }, token))
    expect(invalid).toBe(400)

    const [unauthorized] = await call(
      '/api/orders',
      post({ items: [{ productId: 'prod-0001', quantity: 1 }] }),
    )
    expect(unauthorized).toBe(401)
  })

  it('answers 409 and names the product that ran out', async () => {
    const token = await signIn()
    const product = findProduct('prod-0001')
    if (!product) throw new Error('seed data is missing prod-0001')
    const [status, body] = await call<ApiError>(
      '/api/orders',
      post({ items: [{ productId: product.id, quantity: product.stock + 1 }] }, token),
    )
    expect(status).toBe(409)
    expect(body.error.details).toEqual({ [product.id]: String(product.stock) })
  })

  it('answers 404 for an unknown order and 401 without a token', async () => {
    const token = await signIn()
    const [missing] = await call('/api/orders/order-999', withToken(token))
    expect(missing).toBe(404)
    const [unauthorized] = await call('/api/orders/order-1')
    expect(unauthorized).toBe(401)
  })
})
