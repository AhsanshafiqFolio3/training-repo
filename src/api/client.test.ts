import { beforeEach, describe, expect, it } from 'vitest'
import { DEMO_USER, resetMockDatabase } from '../mocks/mock-database'
import { DEFAULT_MOCK_SETTINGS, saveMockSettings } from '../mocks/mock-settings'
import { ApiRequestError } from './api-request-error'
import { getCurrentUser, login } from './auth'
import { setAuthToken } from './client'
import { getProduct } from './products'

beforeEach(() => {
  sessionStorage.clear()
  saveMockSettings({ ...DEFAULT_MOCK_SETTINGS, latency: 'none' })
  resetMockDatabase()
  setAuthToken(null)
})

describe('api client', () => {
  it('turns an error response into an ApiRequestError with status and code', async () => {
    const error: unknown = await getProduct('prod-9999').catch((caught: unknown) => caught)
    expect(error).toBeInstanceOf(ApiRequestError)
    expect(error).toMatchObject({ httpStatus: 404, code: 'PRODUCT_NOT_FOUND' })
  })

  it('sends the saved token on later requests', async () => {
    await expect(getCurrentUser()).rejects.toMatchObject({ httpStatus: 401 })

    const { token } = await login({ email: DEMO_USER.email, password: DEMO_USER.password })
    setAuthToken(token)
    await expect(getCurrentUser()).resolves.toMatchObject({ email: DEMO_USER.email })
  })

  it('passes cancellation through instead of reporting a failure', async () => {
    saveMockSettings({ ...DEFAULT_MOCK_SETTINGS, latency: 'slow' })
    const controller = new AbortController()
    const request = getProduct('prod-0001', controller.signal)
    controller.abort()
    await expect(request).rejects.toMatchObject({ name: 'AbortError' })
  })
})
