import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { Store } from './Store'
import { CartProvider } from './CartContext'
import { getProducts } from '../../data/api'
import { products } from '../../data/products'

vi.mock('../../data/api', () => ({ getProducts: vi.fn() }))
beforeEach(() => {
  vi.mocked(getProducts).mockResolvedValue({ data: [...products], total: 20 })
})
function renderStore(): void {
  render(
    <MemoryRouter>
      <CartProvider>
        <Store />
      </CartProvider>
    </MemoryRouter>,
  )
}
describe('store interactions', () => {
  it('adds twice into a single cart row and supports decrement and explicit removal', async () => {
    const user = userEvent.setup()
    renderStore()
    const add = await screen.findByRole('button', { name: 'Add Studio Wireless to bag' })
    await user.click(add)
    await user.click(add)
    expect(screen.getAllByTestId('cart-row')).toHaveLength(1)
    expect(screen.getByLabelText('Quantity for Studio Wireless')).toHaveTextContent('2')
    const bag = screen.getByRole('complementary', { name: 'Shopping bag' })
    expect(within(bag).getByText('Rs. 6,998')).toBeInTheDocument()
    expect(within(bag).getByText('Rs. 6,298.20')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Decrease Studio Wireless' }))
    expect(screen.getByLabelText('Quantity for Studio Wireless')).toHaveTextContent('1')
    await user.click(screen.getByRole('button', { name: 'Remove Studio Wireless' }))
    expect(screen.queryByTestId('cart-row')).not.toBeInTheDocument()
  })
  it('combines filters and restores results after a no-match search', async () => {
    const user = userEvent.setup()
    renderStore()
    await screen.findByRole('heading', { name: 'Studio Wireless' })
    const search = screen.getByRole('searchbox', { name: 'Search products' })
    await user.type(search, 'Pebble')
    expect(screen.getByRole('heading', { name: 'Pebble Speaker' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Pebble Go' })).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'In stock only' }))
    expect(screen.queryByRole('heading', { name: 'Pebble Go' })).not.toBeInTheDocument()
    await user.clear(search)
    await user.type(search, 'no-such-product')
    expect(screen.getByText('Nothing here, just yet.')).toBeInTheDocument()
    await user.click(
      within(screen.getByRole('status')).getByRole('button', { name: 'Clear filters' }),
    )
    expect(screen.getByRole('heading', { name: 'Studio Wireless' })).toBeInTheDocument()
  })
  it('shows errors and retries successfully', async () => {
    vi.mocked(getProducts).mockRejectedValueOnce(new Error('Offline'))
    const user = userEvent.setup()
    renderStore()
    expect(await screen.findByRole('alert')).toHaveTextContent('Offline')
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { name: 'Studio Wireless' })).toBeInTheDocument()
  })
})
