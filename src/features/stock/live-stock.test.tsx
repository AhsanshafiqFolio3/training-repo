import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor, within } from '@testing-library/react'
import { readStockMessage, retryDelay } from '../../api/stock-feed'
import { findProduct } from '../../mocks/mock-database'
import { readMockSettings, saveMockSettings } from '../../mocks/mock-settings'
import { dropStockSockets, mockStockServerState, setMockStock } from '../../mocks/mock-stock-socket'
import { renderApp, resetMockApi } from '../../test/render-app'

function setFeedDown(isDown: boolean): void {
  saveMockSettings({ ...readMockSettings(), stockFeedDown: isDown })
  if (isDown) dropStockSockets()
}

beforeEach(() => {
  resetMockApi()
  // Retry delays use Math.random for jitter; 0 makes them as short as possible.
  vi.spyOn(Math, 'random').mockReturnValue(0)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('live stock', () => {
  it('updates the stock on the details page without a refresh', async () => {
    const product = findProduct('prod-0001')
    if (!product) throw new Error('seed data changed')
    renderApp('/products/prod-0001')

    expect(await screen.findByText(`${product.stock} in stock`)).toBeInTheDocument()
    await screen.findByText('Live stock')

    act(() => setMockStock('prod-0001', 2))
    expect(await screen.findByText('2 in stock')).toBeInTheDocument()

    act(() => setMockStock('prod-0001', 0))
    expect(await screen.findByText('Out of stock')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sold out' })).toBeDisabled()
  })

  it('updates the cards on screen in the shop', async () => {
    renderApp('/')
    const grid = await screen.findByRole('list', { name: 'Products' })
    await screen.findByText('Live stock')
    const firstCard = within(grid).getAllByRole('article')[0]
    if (!firstCard) throw new Error('no cards')
    const firstLink = within(firstCard).getByRole('link')
    const productId = firstLink.getAttribute('href')?.split('/').pop() ?? ''

    // The page subscribes once scrolling has paused, a moment after the cards appear.
    await waitFor(() => {
      act(() => setMockStock(productId, 1))
      expect(within(firstCard).getByText('1 in stock')).toBeInTheDocument()
    })
  })

  it('reconnects after the connection drops, and catches up on what changed', async () => {
    renderApp('/products/prod-0001')
    await screen.findByText('Live stock')

    act(() => setFeedDown(true))
    expect(await screen.findByText('Live stock lost. Reconnecting…')).toBeInTheDocument()

    // Stock changes while we're disconnected; the next subscribe sends the current value.
    const product = findProduct('prod-0001')
    if (product) product.stock = 7
    act(() => setFeedDown(false))

    expect(await screen.findByText('Live stock', {}, { timeout: 3000 })).toBeInTheDocument()
    expect(await screen.findByText('7 in stock')).toBeInTheDocument()
  })

  it('closes the socket and stops all timers when the page closes', async () => {
    const { unmount } = renderApp('/products/prod-0001')
    await screen.findByText('Live stock')
    expect(mockStockServerState()).toEqual({ openSockets: 1, isChanging: true })

    unmount()
    expect(mockStockServerState()).toEqual({ openSockets: 0, isChanging: false })
  })

  it('does not reconnect after the page closes, even if the server dropped it first', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      const { unmount } = renderApp('/products/prod-0001')
      await screen.findByText('Live stock')
      act(() => setFeedDown(true))
      await screen.findByText('Live stock lost. Reconnecting…')

      unmount()
      setFeedDown(false)
      await vi.advanceTimersByTimeAsync(60_000)
      expect(mockStockServerState().openSockets).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('stock feed helpers', () => {
  it('waits longer after each failed attempt, up to 15 seconds', () => {
    expect([0, 1, 2, 3, 4, 10].map((attempt) => retryDelay(attempt, () => 1))).toEqual([
      1000, 2000, 4000, 8000, 15_000, 15_000,
    ])
    // The random part only ever shortens the wait, down to half.
    expect(retryDelay(3, () => 0)).toBe(4000)
  })

  it('skips messages that are not valid stock updates', () => {
    expect(readStockMessage('not json')).toBeNull()
    expect(readStockMessage(JSON.stringify({ type: 'hello' }))).toBeNull()
    expect(
      readStockMessage(
        JSON.stringify({
          type: 'stock',
          updates: [{ productId: 'prod-0001', stock: 3 }, { productId: 'prod-0002' }],
        }),
      ),
    ).toEqual({ type: 'stock', updates: [{ productId: 'prod-0001', stock: 3 }] })
  })
})
