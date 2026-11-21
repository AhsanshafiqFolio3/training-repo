import type { ApiRequestError } from './api-request-error'

// One place decides what every API error means for the user. Pages never show
// error.message (that's written for developers); they show what this file returns.

export type ErrorKind =
  | 'invalid-input' // 400: show the problems next to the form fields
  | 'signed-out' // 401: the session ended, sign in again
  | 'not-found' // 404: show the Not Found page
  | 'out-of-stock' // 409: name the items that ran out
  | 'server' // 500 and anything unexpected: offer a retry
  | 'offline' // no response at all: offer a retry

export function errorKind(error: ApiRequestError): ErrorKind {
  switch (error.httpStatus) {
    case 0:
      return 'offline'
    case 400:
      return 'invalid-input'
    case 401:
      return 'signed-out'
    case 404:
      return 'not-found'
    case 409:
      return 'out-of-stock'
    default:
      return 'server'
  }
}

export type ErrorDescription = {
  title: string
  message: string
  canRetry: boolean
}

const DESCRIPTIONS: Record<ErrorKind, ErrorDescription> = {
  'invalid-input': {
    title: 'Some details need fixing.',
    message: 'Check the highlighted fields and try again.',
    canRetry: false,
  },
  'signed-out': {
    title: 'Please sign in again.',
    message: 'Your session has ended. Sign in to carry on where you left off.',
    canRetry: false,
  },
  'not-found': {
    title: 'We couldn’t find that.',
    message: 'It may have been removed, or the link is wrong.',
    canRetry: false,
  },
  'out-of-stock': {
    title: 'Some items just sold out.',
    message: 'Update your cart to the amounts we have left.',
    canRetry: false,
  },
  server: {
    title: 'Something went wrong on our side.',
    message: 'It’s not you. Please try again in a moment.',
    canRetry: true,
  },
  offline: {
    title: 'We couldn’t reach the store.',
    message: 'Check your connection and try again.',
    canRetry: true,
  },
}

export function describeError(error: ApiRequestError): ErrorDescription {
  return DESCRIPTIONS[errorKind(error)]
}

// 400: details maps field name → a short problem written for users ("Enter your email.").
export function fieldErrorsOf(error: ApiRequestError): Record<string, string> {
  return errorKind(error) === 'invalid-input' ? error.details : {}
}

// 409: details maps product id → units left, as text. Returns them as numbers.
export function stockLeftOf(error: ApiRequestError): Record<string, number> {
  if (errorKind(error) !== 'out-of-stock') return {}
  return Object.fromEntries(
    Object.entries(error.details).map(([productId, left]) => [productId, Number(left) || 0]),
  )
}
