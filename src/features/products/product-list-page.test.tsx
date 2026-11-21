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

  it('adds a product twice into one cart row, then decreases and removes it', async () => {
    const user = userEvent.setup()
    renderApp()
    const { name, price } = seededProduct('prod-0001')
    const addButton = await screen.findByRole('button', { name: `Add ${name} to cart` })
    await user.click(addButton)
    await user.click(addButton)

    expect(screen.getAllByTestId('cart-row')).toHaveLength(1)
    expect(screen.getByLabelText(`Quantity for ${name}`)).toHaveTextContent('2')
    const cart = screen.getByRole('complementary', { name: 'Shopping cart' })
    expect(within(cart).getByText(formatPrice(price * 2))).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: `Decrease ${name}` }))
    expect(screen.getByLabelText(`Quantity for ${name}`)).toHaveTextContent('1')
    await user.click(screen.getByRole('button', { name: `Remove ${name}` }))
    expect(screen.queryByTestId('cart-row')).not.toBeInTheDocument()
  })
})

describe('product details', () => {
  it('opens from the grid and shows image, name, price and stock', async () => {
    const user = userEvent.setup()
    renderApp()
    const { name, price } = seededProduct('prod-0001')
    await user.click(await screen.findByRole('link', { name }))

    expect(await screen.findByRole('heading', { level: 1, name })).toBeInTheDocument()
    expect(screen.getByText(formatPrice(price))).toBeInTheDocument()
    expect(screen.getByText(/in stock|out of stock/i)).toBeInTheDocument()
  })
})
