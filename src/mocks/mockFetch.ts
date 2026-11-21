import { wait } from '../shared/wait'
import { getCurrentUser, login } from './handlers/authHandlers'
import { createOrder, getOrder } from './handlers/orderHandlers'
import { getProduct, listProducts } from './handlers/productHandlers'
import { errorResponse } from './mockResponses'
import type { MockRequest } from './mockRequest'
import { latencyMs, readMockSettings } from './mockSettings'

type Route = {
  method: 'GET' | 'POST'
  path: string
  handler: (request: MockRequest) => Response
}

const ROUTES: readonly Route[] = [
  { method: 'GET', path: '/api/products', handler: listProducts },
  { method: 'GET', path: '/api/products/:id', handler: getProduct },
  { method: 'POST', path: '/api/login', handler: login },
  { method: 'GET', path: '/api/me', handler: getCurrentUser },
  { method: 'POST', path: '/api/orders', handler: createOrder },
  { method: 'GET', path: '/api/orders/:id', handler: getOrder },
]

// Matches "/api/products/prod-0001" against "/api/products/:id"
// and returns { id: 'prod-0001' }, or null when it doesn't match.
function matchPath(pattern: string, pathname: string): Record<string, string> | null {
  const patternParts = pattern.split('/')
  const pathParts = pathname.split('/')
  if (patternParts.length !== pathParts.length) return null

  const params: Record<string, string> = {}
  for (const [index, patternPart] of patternParts.entries()) {
    const pathPart = pathParts[index] ?? ''
    if (patternPart.startsWith(':')) params[patternPart.slice(1)] = decodeURIComponent(pathPart)
    else if (patternPart !== pathPart) return null
  }
  return params
}

function parseBody(body: RequestInit['body']): unknown {
  return typeof body === 'string' ? JSON.parse(body) : undefined
}

// Same signature as window.fetch, so the API client can use either one.
export async function mockFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const url = new URL(input, window.location.origin)
  const method = (init.method ?? 'GET').toUpperCase()

  // Rejects with an AbortError if the caller cancels while we "wait for the network".
  await wait(latencyMs(readMockSettings().latency), init.signal ?? undefined)

  for (const route of ROUTES) {
    const params = route.method === method ? matchPath(route.path, url.pathname) : null
    if (!params) continue

    let body: unknown
    try {
      body = parseBody(init.body)
    } catch {
      return errorResponse(400, 'INVALID_JSON', 'The request body is not valid JSON.')
    }
    return route.handler({ url, params, headers: new Headers(init.headers), body })
  }

  return errorResponse(404, 'NOT_FOUND', `No mock route for ${method} ${url.pathname}.`)
}
