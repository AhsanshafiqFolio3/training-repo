import { beforeEach, describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { findProduct } from '../../mocks/mock-database'
import { formatPrice } from '../../shared/format-price'
import { loadPersistedState } from '../../store/persistence'
import { renderApp, resetMockApi } from '../../test/render-app'
import { itemAdded } from './cart-slice'

function seeded(id: string): NonNullable<ReturnType<typeof findProduct>> {
  const product = findProduct(id)
  if (!product) throw new Error(`seed data is missing ${id}`)
  return { ...product }
}

// A product with plenty of stock, so quantity changes have room.
function roomyProduct(): NonNullable<ReturnType<typeof findProduct>> {
  return { ...seeded('prod-0001'), stock: 10 }
}

beforeEach(() => {
  resetMockApi()
})

describe('cart', () => {
  it('updates the header badge from the cart (a derived count)', async () => {
    const user = userEvent.setup()
    renderApp()
    const { name } = seeded('prod-0002')
    const badge = screen.getByLabelText('0 items in cart')

    await user.click(await screen.findByRole('button', { name: `Add ${name} to cart` }))
    expect(badge).toHaveAccessibleName('1 items in cart')
    expect(badge).toHaveTextContent('1')
  })

  it('changes quantities, never above the stock, and removes lines', async () => {
    const user = userEvent.setup()
    const product = roomyProduct()
    const { store } = renderApp('/cart')
    store.dispatch(itemAdded(product))

    const quantity = await screen.findByRole('spinbutton', { name: `Quantity for ${product.name}` })
    await user.click(screen.getByRole('button', { name: `Increase ${product.name}` }))
    expect(quantity).toHaveValue(2)
    expect(screen.getByTestId('cart-total')).toHaveTextContent(formatPrice(product.price * 2))

    await user.clear(quantity)
    await user.type(quantity, '99')
    expect(quantity).toHaveValue(10)
    expect(screen.getByText('Only 10 in stock')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Increase ${product.name}` })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: `Remove ${product.name}` }))
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument()
  })

  it('survives a reload', () => {
    const product = roomyProduct()
    const { store, unmount } = renderApp('/cart')
    store.dispatch(itemAdded(product))
    store.dispatch(itemAdded(product))
    unmount()

    // A reload builds a new store from whatever was saved.
    renderApp('/cart', loadPersistedState())
    const list = screen.getByRole('list', { name: 'Items in your cart' })
    expect(within(list).getByRole('spinbutton')).toHaveValue(2)
  })
})
