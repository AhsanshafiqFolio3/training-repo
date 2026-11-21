import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEMO_USER } from '../mocks/mock-database'
import { readMockSettings, saveMockSettings } from '../mocks/mock-settings'
import { resetMockApi } from '../test/render-app'
import { ApiRequestError } from './api-request-error'
import { getCurrentUser, login } from './auth'
import { configureApiClient } from './client'
import { getProduct } from './products'

let token: string | null = null
const onUnauthorized = vi.fn<() => void>()

beforeEach(() => {
  resetMockApi()
  token = null
  onUnauthorized.mockClear()
  configureApiClient({ getToken: () => token, onUnauthorized })
})

describe('api client', () => {
  it('turns an error response into an ApiRequestError with status and code', async () => {
    const error: unknown = await getProduct('prod-9999').catch((caught: unknown) => caught)
    expect(error).toBeInstanceOf(ApiRequestError)
    expect(error).toMatchObject({ httpStatus: 404, code: 'PRODUCT_NOT_FOUND' })
  })

  it('sends the current token on requests', async () => {
    await expect(getCurrentUser()).rejects.toMatchObject({ httpStatus: 401 })

    token = (await login({ email: DEMO_USER.email, password: DEMO_USER.password })).token
    await expect(getCurrentUser()).resolves.toMatchObject({ email: DEMO_USER.email })
  })

  it('reports a 401 as an expired session only when a token was sent', async () => {
    await expect(login({ email: DEMO_USER.email, password: 'wrong' })).rejects.toMatchObject({
      httpStatus: 401,
    })
    expect(onUnauthorized).not.toHaveBeenCalled()

    token = 'mock-token.user-1.0'
    await expect(getCurrentUser()).rejects.toMatchObject({ httpStatus: 401 })
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })

  it('passes cancellation through instead of reporting a failure', async () => {
    saveMockSettings({ ...readMockSettings(), latency: 'slow' })
    const controller = new AbortController()
    const request = getProduct('prod-0001', controller.signal)
    controller.abort()
    await expect(request).rejects.toMatchObject({ name: 'AbortError' })
  })
})
