import { beforeEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Product } from '../../api/types'
import { findProduct, mockDatabase } from '../../mocks/mock-database'
import { readMockSettings, saveMockSettings } from '../../mocks/mock-settings'
import { countRequests, renderApp, resetMockApi, signedInState } from '../../test/render-app'

function seeded(id: string): Product {
  const product = findProduct(id)
  if (!product) throw new Error(`seed data is missing ${id}`)
  return { ...product }
}

// Renders checkout as a signed-in user with `quantity` of `product` in the cart.
function renderCheckout(product: Product, quantity: number): ReturnType<typeof renderApp> {
  return renderApp('/checkout', {
    ...signedInState(),
    cart: { lines: [{ product, quantity }], checkoutKey: null },
  })
}

beforeEach(() => {
  resetMockApi()
})

describe('checkout', () => {
  it('places an order, shows the confirmation and empties the cart', async () => {
    const user = userEvent.setup()
    const product = seeded('prod-0001')
    const stockBefore = product.stock
    const { store } = renderCheckout(product, 1)

    await user.click(screen.getByRole('button', { name: 'Place order' }))

    expect(
      await screen.findByRole('heading', { name: 'Thanks for your order!' }),
    ).toBeInTheDocument()
    expect(screen.getByText('order-1')).toBeInTheDocument()
    expect(store.getState().cart.lines).toEqual([])
    expect(findProduct(product.id)?.stock).toBe(stockBefore - 1)
  })

  it('on a 409, names the item that ran out and lets the user fix the cart', async () => {
    const user = userEvent.setup()
    // Our cart thinks there are 50, but the server only has the real stock.
    const product = seeded('prod-0001')
    const realStock = product.stock
    const { store } = renderCheckout({ ...product, stock: 50 }, realStock + 2)

    await user.click(screen.getByRole('button', { name: 'Place order' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Some items just sold out.')
    expect(alert).toHaveTextContent(product.name)
    expect(alert).toHaveTextContent(`only ${realStock} left`)

    await user.click(screen.getByRole('button', { name: 'Update my cart' }))
    expect(store.getState().cart.lines[0]?.quantity).toBe(realStock)
    expect(mockDatabase.orders).toHaveLength(0)
  })

  it('a retried checkout does not create a second order', async () => {
    const user = userEvent.setup()
    // The order is saved, but the reply never arrives.
    saveMockSettings({ ...readMockSettings(), loseOrderReplies: true })
    renderCheckout(seeded('prod-0001'), 1)

    await user.click(screen.getByRole('button', { name: 'Place order' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t reach the store.')
    expect(mockDatabase.orders).toHaveLength(1)

    // The connection is back. Retrying sends the same Idempotency-Key.
    saveMockSettings({ ...readMockSettings(), loseOrderReplies: false })
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(
      await screen.findByRole('heading', { name: 'Thanks for your order!' }),
    ).toBeInTheDocument()
    expect(countRequests('POST /api/orders')).toBe(2)
    expect(mockDatabase.orders).toHaveLength(1)
  })
})

describe('caching', () => {
  it('reuses product data when revisiting a page, and refetches after an order', async () => {
    const user = userEvent.setup()
    const product = seeded('prod-0001')
    renderApp('/', signedInState())
    await user.click(await screen.findByRole('link', { name: product.name }))
    await screen.findByRole('heading', { level: 1, name: product.name })
    await user.click(screen.getByRole('link', { name: 'Back to all products' }))
    await screen.findByRole('list', { name: 'Products' })

    // The list was fetched once, even though we visited it twice.
    expect(countRequests('GET /api/products')).toBe(1)

    await user.click(screen.getByRole('button', { name: `Add, ${product.name}` }))
    await user.click(screen.getByRole('link', { name: /items in cart/ }))
    await user.click(await screen.findByRole('link', { name: 'Go to checkout' }))
    await user.click(await screen.findByRole('button', { name: 'Place order' }))
    await screen.findByRole('heading', { name: 'Thanks for your order!' })

    // Stock changed, so the next visit asks the server again.
    await user.click(screen.getByRole('link', { name: 'Keep shopping' }))
    await screen.findByRole('list', { name: 'Products' })
    expect(countRequests('GET /api/products')).toBe(2)
  })
})
