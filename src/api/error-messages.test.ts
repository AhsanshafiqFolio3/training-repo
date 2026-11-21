import { describe, expect, it } from 'vitest'
import { ApiRequestError } from './api-request-error'
import { describeError, errorKind, fieldErrorsOf, stockLeftOf } from './error-messages'

function makeError(httpStatus: number, details?: Record<string, string>): ApiRequestError {
  return new ApiRequestError(httpStatus, {
    code: 'ANY',
    message: 'Raw developer message: stack trace at line 42',
    details,
  })
}

describe('error messages', () => {
  it('maps every status to one kind of response', () => {
    expect(errorKind(makeError(400))).toBe('invalid-input')
    expect(errorKind(makeError(401))).toBe('signed-out')
    expect(errorKind(makeError(404))).toBe('not-found')
    expect(errorKind(makeError(409))).toBe('out-of-stock')
    expect(errorKind(makeError(500))).toBe('server')
    expect(errorKind(makeError(503))).toBe('server')
    expect(errorKind(makeError(0))).toBe('offline')
  })

  it('never passes the raw server message to the screen', () => {
    for (const status of [0, 400, 401, 404, 409, 500]) {
      const { title, message } = describeError(makeError(status))
      expect(`${title} ${message}`).not.toContain('Raw developer message')
    }
  })

  it('offers a retry only where retrying can help', () => {
    expect(describeError(makeError(500)).canRetry).toBe(true)
    expect(describeError(makeError(0)).canRetry).toBe(true)
    expect(describeError(makeError(400)).canRetry).toBe(false)
    expect(describeError(makeError(404)).canRetry).toBe(false)
  })

  it('reads field errors from a 400 and stock left from a 409', () => {
    expect(fieldErrorsOf(makeError(400, { email: 'Enter your email.' }))).toEqual({
      email: 'Enter your email.',
    })
    expect(fieldErrorsOf(makeError(500, { email: 'x' }))).toEqual({})
    expect(stockLeftOf(makeError(409, { 'prod-0001': '2', 'prod-0002': '0' }))).toEqual({
      'prod-0001': 2,
      'prod-0002': 0,
    })
  })
})
