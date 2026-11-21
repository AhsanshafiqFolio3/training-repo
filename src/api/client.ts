import { mockFetch } from '../mocks/mock-fetch'
import { ApiRequestError } from './api-request-error'
import { API_BASE_URL, USE_MOCK_API } from './config'
import type { ApiError } from './types'

// Every request in the app goes through apiRequest(). Components and hooks call the
// functions in src/api/*.ts instead of fetch, so headers, the auth token and error
// handling are written once, here.

type RequestOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

// The mock has the same signature as fetch, so switching is one line.
const send: typeof mockFetch = USE_MOCK_API ? mockFetch : (input, init) => fetch(input, init)

type ClientHooks = {
  // Where the current token comes from (the Redux session).
  getToken: () => string | null
  // Called when a request that carried a token gets a 401: the session is no longer valid.
  onUnauthorized: () => void
}

let hooks: ClientHooks = { getToken: () => null, onUnauthorized: () => {} }

// Called once when the store is created (src/store/store.ts). The client doesn't
// import the store itself, which keeps this file free of React and Redux.
export function configureApiClient(nextHooks: ClientHooks): void {
  hooks = nextHooks
}

function isApiError(body: unknown): body is ApiError {
  if (typeof body !== 'object' || body === null) return false
  const error: unknown = Reflect.get(body, 'error')
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export async function apiRequest<TResponse>(
  path: string,
  { method = 'GET', body, headers = {}, signal }: RequestOptions = {},
): Promise<TResponse> {
  const requestHeaders: Record<string, string> = { Accept: 'application/json', ...headers }
  if (body !== undefined) requestHeaders['Content-Type'] = 'application/json'
  const token = hooks.getToken()
  if (token) requestHeaders.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await send(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    // A cancelled request is not a failure. Let the caller see it as it is.
    if (isAbortError(error)) throw error
    throw new ApiRequestError(0, {
      code: 'NETWORK_ERROR',
      message: 'Could not reach the server.',
    })
  }

  const responseBody: unknown = await response.json().catch(() => null)
  // Only a request that sent a token can have an expired session. A 401 from the
  // login form just means a wrong password.
  if (response.status === 401 && token) hooks.onUnauthorized()
  if (!response.ok) {
    throw new ApiRequestError(
      response.status,
      isApiError(responseBody)
        ? responseBody.error
        : { code: 'UNKNOWN_ERROR', message: `Request failed with status ${response.status}.` },
    )
  }
  // We trust the server to follow docs/api-contract.md, so the body is not re-checked here.
  return responseBody as TResponse
}
