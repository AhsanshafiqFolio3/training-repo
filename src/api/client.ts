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

let authToken: string | null = null

export function setAuthToken(token: string | null): void {
  authToken = token
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
  if (authToken) requestHeaders.Authorization = `Bearer ${authToken}`

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
