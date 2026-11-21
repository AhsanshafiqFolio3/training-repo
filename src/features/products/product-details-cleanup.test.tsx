import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes } from 'react-router'
import { CartProvider } from '../cart/cart-provider'
import { findProduct } from '../../mocks/mock-database'
import { readMockSettings, saveMockSettings } from '../../mocks/mock-settings'
import type { MockLatency } from '../../mocks/mock-settings'
import { resetMockApi } from '../../test/render-app'
import { wait } from '../../shared/wait'
import { ProductDetailsPage } from './product-details-page'

function setLatency(latency: MockLatency): void {
  saveMockSettings({ ...readMockSettings(), latency })
}

function nameOf(id: string): string {
  return findProduct(id)?.name ?? ''
}

// The details page stays mounted while these links change the :id in the URL,
// just like clicking a related product.
function renderDetails(): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={['/products/prod-0001']}>
      <CartProvider>
        <Link to="/products/prod-0002">Open second</Link>
        <Link to="/products/prod-0003">Open third</Link>
        <Routes>
          <Route path="/products/:id" element={<ProductDetailsPage />} />
        </Routes>
      </CartProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  resetMockApi()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('details page cleanup', () => {
  it('never shows a slow, older product after switching to a newer one', async () => {
    const user = userEvent.setup()
    renderDetails()
    await screen.findByRole('heading', { level: 1, name: nameOf('prod-0001') })

    // The second product answers slowly (2 s); the third answers at once.
    setLatency('slow')
    await user.click(screen.getByRole('link', { name: 'Open second' }))
    setLatency('none')
    await user.click(screen.getByRole('link', { name: 'Open third' }))
    await screen.findByRole('heading', { level: 1, name: nameOf('prod-0003') })

    // Wait until the slow response would have arrived.
    await act(() => wait(2200))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(nameOf('prod-0003'))
    expect(screen.queryByText(nameOf('prod-0002'))).not.toBeInTheDocument()
  }, 10_000)

  it('cancels the request and removes the scroll listener when the page closes', async () => {
    const abort = vi.spyOn(AbortController.prototype, 'abort')
    const removeListener = vi.spyOn(window, 'removeEventListener')
    setLatency('slow')
    const { unmount } = renderDetails()

    unmount()

    expect(abort).toHaveBeenCalled()
    expect(removeListener).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})

describe('Back to Top button', () => {
  it('appears after scrolling down and scrolls back up when clicked', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const user = userEvent.setup()
    renderDetails()
    expect(screen.queryByRole('button', { name: 'Back to top' })).not.toBeInTheDocument()

    Object.defineProperty(window, 'scrollY', { value: 900, configurable: true })
    fireEvent.scroll(window)
    await user.click(await screen.findByRole('button', { name: 'Back to top' }))

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
  })
})
