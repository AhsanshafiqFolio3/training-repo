import type { ApiError } from '../api/types'

export function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: Record<string, string>,
): Response {
  const body: ApiError = { error: details ? { code, message, details } : { code, message } }
  return jsonResponse(status, body)
}
