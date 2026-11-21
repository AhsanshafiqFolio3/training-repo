import type { ApiError } from './types'

// A failed request, in the same shape everywhere in the app.
// httpStatus is 0 when the request never got a response (offline, blocked).
export class ApiRequestError extends Error {
  readonly httpStatus: number
  readonly code: string
  readonly details: Record<string, string>

  constructor(httpStatus: number, error: ApiError['error']) {
    super(error.message)
    this.name = 'ApiRequestError'
    this.httpStatus = httpStatus
    this.code = error.code
    this.details = error.details ?? {}
  }
}

export function toApiRequestError(error: unknown): ApiRequestError {
  if (error instanceof ApiRequestError) return error
  return new ApiRequestError(0, {
    code: 'NETWORK_ERROR',
    message: error instanceof Error ? error.message : 'The request failed.',
  })
}
