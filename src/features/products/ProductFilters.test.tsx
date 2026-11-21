import { beforeEach, describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp, resetMockApi } from '../../test/renderApp'

function currentUrl(): string {
  return screen.getByTestId('current-url').textContent ?? ''
}

function productCategories(): string[] {
  const grid = screen.getByRole('list', { name: 'Products' })
  return within(grid)
    .getAllByRole('article')
    .map((card) => card.querySelector('.product-meta span')?.textContent ?? '')
}

beforeEach(() => {
  resetMockApi()
})

describe('product filters', () => {
  it('puts filters in the URL and shows a result count', async () => {
    const user = userEvent.setup()
    renderApp()
    await screen.findByRole('list', { name: 'Products' })

    await user.click(screen.getByRole('radio', { name: 'Coffee' }))
    await user.click(screen.getByRole('checkbox', { name: 'In stock only' }))
    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort by' }), 'price-asc')

    expect(currentUrl()).toBe('/?category=coffee&inStock=true&sort=price-asc')
    await waitFor(() => expect(productCategories().every((name) => name === 'coffee')).toBe(true))
    expect(screen.getByText(/^Showing 1–24 of [\d,]+ products$/)).toBeInTheDocument()
  })

  it('shows the same view when the page opens from a copied link', async () => {
    renderApp('/?category=stickers&sort=name')
    await screen.findByRole('list', { name: 'Products' })
    expect(screen.getByRole('radio', { name: 'Stickers' })).toBeChecked()
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveValue('name')
    expect(productCategories().every((name) => name === 'stickers')).toBe(true)
  })

  it('goes back to the previous filters with the Back button', async () => {
    const user = userEvent.setup()
    renderApp('/?category=ducks')
    await screen.findByRole('list', { name: 'Products' })

    await user.click(screen.getByRole('radio', { name: 'Keyboards' }))
    expect(currentUrl()).toBe('/?category=keyboards')

    await user.click(screen.getByRole('button', { name: 'Browser back' }))
    expect(currentUrl()).toBe('/?category=ducks')
    expect(screen.getByRole('radio', { name: 'Rubber ducks' })).toBeChecked()
  })

  it('clears search and filters but keeps the sort order', async () => {
    const user = userEvent.setup()
    renderApp('/?search=zzz-no-match&category=ducks&sort=rating')
    expect(await screen.findByText('No products match.')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Clear filters' })[0] as HTMLElement)
    expect(currentUrl()).toBe('/?sort=rating')
    expect(await screen.findByRole('list', { name: 'Products' })).toBeInTheDocument()
  })
})
