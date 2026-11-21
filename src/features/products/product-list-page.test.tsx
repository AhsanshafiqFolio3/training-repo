import { beforeEach, describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { findProduct } from '../../mocks/mock-database'
import { formatPrice } from '../../shared/format-price'
import { renderApp, resetMockApi } from '../../test/render-app'

function seededProduct(id: string): { name: string; price: number } {
  const product = findProduct(id)
  if (!product) throw new Error(`seed data is missing ${id}`)
  return product
}

beforeEach(() => {
  resetMockApi()
})

describe('product list', () => {
  it('shows each product with its price converted from cents', async () => {
    renderApp()
    const { name, price } = seededProduct('prod-0001')
    const card = (await screen.findByRole('link', { name })).closest('article')
    if (!card) throw new Error('product card not found')
    expect(within(card).getByText(formatPrice(price))).toBeInTheDocument()
    expect(within(card).getByText(/in stock|out of stock/i)).toBeInTheDocument()
  })

  it('moves focus between products with the arrow keys', async () => {
    const user = userEvent.setup()
    renderApp()
    const first = await screen.findByRole('link', { name: seededProduct('prod-0001').name })
    first.focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('link', { name: seededProduct('prod-0002').name })).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(first).toHaveFocus()
  })
})

describe('product details', () => {
  it('opens from the grid and shows image, name, price and stock', async () => {
    const user = userEvent.setup()
    renderApp()
    const { name, price } = seededProduct('prod-0001')
    await user.click(await screen.findByRole('link', { name }))

    const heading = await screen.findByRole('heading', { level: 1, name })
    // Scope to the main product: related products below have their own prices.
    const details = heading.closest('.product-details-info')
    if (!(details instanceof HTMLElement)) throw new Error('details panel not found')
    expect(within(details).getByText(formatPrice(price))).toBeInTheDocument()
    expect(within(details).getByText(/in stock|out of stock/i)).toBeInTheDocument()
  })
})
