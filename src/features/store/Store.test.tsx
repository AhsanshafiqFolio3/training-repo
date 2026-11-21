import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { findProduct, resetMockDatabase } from '../../mocks/mockDatabase'
import { DEFAULT_MOCK_SETTINGS, saveMockSettings } from '../../mocks/mockSettings'
import { formatPrice } from '../../shared/formatPrice'
import { CartProvider } from './CartProvider'
import { Store } from './Store'

function renderStore(): void {
  render(
    <MemoryRouter>
      <CartProvider>
        <Store />
      </CartProvider>
    </MemoryRouter>,
  )
}

function firstProduct(): { name: string; price: number } {
  const product = findProduct('prod-0001')
  if (!product) throw new Error('seed data is missing prod-0001')
  return product
}

beforeEach(() => {
  sessionStorage.clear()
  saveMockSettings({ ...DEFAULT_MOCK_SETTINGS, latency: 'none' })
  resetMockDatabase()
})

describe('store', () => {
  it('shows products from the API with prices converted from cents', async () => {
    renderStore()
    const { name, price } = firstProduct()
    const card = (await screen.findByRole('heading', { name })).closest('article')
    if (!card) throw new Error('product card not found')
    expect(within(card).getByText(formatPrice(price))).toBeInTheDocument()
  })

  it('adds a product twice into one cart row, then decreases and removes it', async () => {
    const user = userEvent.setup()
    renderStore()
    const { name, price } = firstProduct()
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

  it('shows an error when the API fails and recovers on retry', async () => {
    saveMockSettings({ ...DEFAULT_MOCK_SETTINGS, latency: 'none', failProductRequests: true })
    const user = userEvent.setup()
    renderStore()
    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load the products.')

    saveMockSettings({ ...DEFAULT_MOCK_SETTINGS, latency: 'none' })
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { name: firstProduct().name })).toBeInTheDocument()
  })
})
