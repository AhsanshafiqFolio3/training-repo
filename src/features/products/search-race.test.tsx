import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readMockSettings, saveMockSettings } from '../../mocks/mock-settings'
import { renderApp, resetMockApi } from '../../test/render-app'
import { wait } from '../../shared/wait'

function shownProductNames(): string[] {
  const grid = screen.getByRole('list', { name: 'Products' })
  return within(grid)
    .getAllByRole('link')
    .map((link) => link.textContent ?? '')
}

beforeEach(() => {
  resetMockApi()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('search race conditions', () => {
  it('shows results for the latest query even when an older response arrives last', async () => {
    const user = userEvent.setup()
    renderApp()
    await screen.findByRole('list', { name: 'Products' })

    // From now on the mock picks a delay per request with Math.random.
    // Force the order: the "duck" request takes 1.5 s, the "roast" request 0.1 s.
    saveMockSettings({ ...readMockSettings(), latency: 'random' })
    const random = vi.spyOn(Math, 'random').mockReturnValue(1)

    const searchBox = screen.getByRole('searchbox', { name: 'Search products' })
    await user.type(searchBox, 'duck')
    await act(() => wait(400)) // the debounce fires and the slow "duck" request starts
    random.mockReturnValue(0)
    await user.clear(searchBox)
    await user.type(searchBox, 'roast')

    await waitFor(() => {
      expect(shownProductNames().every((name) => name.toLowerCase().includes('roast'))).toBe(true)
    })

    // Wait until the slow "duck" response would have arrived, then check again.
    await act(() => wait(1600))
    expect(screen.getByRole('searchbox', { name: 'Search products' })).toHaveValue('roast')
    expect(shownProductNames().every((name) => name.toLowerCase().includes('roast'))).toBe(true)
  }, 10_000)
})
