import { beforeEach, describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readMockSettings, saveMockSettings } from '../../mocks/mock-settings'
import { countRequests, renderApp, resetMockApi } from '../../test/render-app'

function cardCount(): number {
  return within(screen.getByRole('list', { name: 'Products' })).getAllByRole('article').length
}

beforeEach(() => {
  resetMockApi()
})

describe('product list loading more', () => {
  it('loads the next page under the first one', async () => {
    const user = userEvent.setup()
    renderApp()
    await screen.findByRole('list', { name: 'Products' })
    expect(cardCount()).toBe(24)

    await user.click(screen.getByRole('button', { name: 'Load more products' }))
    await waitFor(() => expect(cardCount()).toBe(48))
    expect(countRequests('GET /api/products?page=2')).toBe(1)
  })

  it('keeps the products it has when a later page fails, and can retry', async () => {
    const user = userEvent.setup()
    renderApp()
    await screen.findByRole('list', { name: 'Products' })

    saveMockSettings({ ...readMockSettings(), failProductRequests: true })
    await user.click(screen.getByRole('button', { name: 'Load more products' }))
    expect(await screen.findByText("The next products didn't load.")).toBeInTheDocument()
    expect(cardCount()).toBe(24)

    saveMockSettings({ ...readMockSettings(), failProductRequests: false })
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() => expect(cardCount()).toBe(48))
  })

  it('starts again from the first page when a filter changes', async () => {
    const user = userEvent.setup()
    renderApp()
    await screen.findByRole('list', { name: 'Products' })
    await user.click(screen.getByRole('button', { name: 'Load more products' }))
    await waitFor(() => expect(cardCount()).toBe(48))

    await user.click(screen.getByRole('radio', { name: 'Coffee' }))
    await waitFor(() => expect(countRequests('GET /api/products?category=coffee')).toBe(1))
    await waitFor(() => expect(cardCount()).toBe(24))
  })

  it('says when every product is loaded', async () => {
    renderApp('/?search=%231000')
    await screen.findByRole('list', { name: 'Products' })
    expect(screen.queryByRole('button', { name: 'Load more products' })).not.toBeInTheDocument()
    expect(screen.getByText(/^That's all \d+ products?\.$/)).toBeInTheDocument()
  })
})
