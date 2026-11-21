import { beforeEach, describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readMockSettings, saveMockSettings } from '../../mocks/mock-settings'
import { countRequests, renderApp, resetMockApi } from '../../test/render-app'
import { targetIndexForKey } from './grid-navigation'
import { visibleRows } from './use-virtual-rows'

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

describe('virtual grid maths', () => {
  // 100 rows of 400px on a 900px screen, 3 extra rows drawn above and below.
  it('draws only the rows near the screen', () => {
    expect(visibleRows(0, 900, 400, 100)).toEqual({ first: 0, last: 6 })
    expect(visibleRows(10_000, 900, 400, 100)).toEqual({ first: 22, last: 31 })
  })

  it('never draws rows past either end of the list', () => {
    expect(visibleRows(-5000, 900, 400, 100)).toEqual({ first: 0, last: 0 })
    expect(visibleRows(39_800, 900, 400, 100)).toEqual({ first: 96, last: 100 })
  })

  it('moves by a row with up and down, and stays inside the grid', () => {
    // 10 cards in rows of 4: the last row holds cards 8 and 9.
    expect(targetIndexForKey('ArrowDown', 1, 4, 10)).toBe(5)
    expect(targetIndexForKey('ArrowDown', 6, 4, 10)).toBeUndefined()
    expect(targetIndexForKey('ArrowUp', 2, 4, 10)).toBeUndefined()
    expect(targetIndexForKey('End', 0, 4, 10)).toBe(9)
    expect(targetIndexForKey('a', 0, 4, 10)).toBeUndefined()
  })
})
