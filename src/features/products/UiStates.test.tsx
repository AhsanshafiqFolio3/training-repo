import { beforeEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { findProduct } from '../../mocks/mockDatabase'
import { readMockSettings, saveMockSettings } from '../../mocks/mockSettings'
import { renderApp, resetMockApi } from '../../test/renderApp'

function setProductRequestsFailing(isFailing: boolean): void {
  saveMockSettings({ ...readMockSettings(), failProductRequests: isFailing })
}

beforeEach(() => {
  resetMockApi()
})

describe('UI states on the product list', () => {
  it('shows a loading state, then the products', async () => {
    resetMockApi({ latency: 'normal' })
    renderApp()
    expect(screen.getByRole('status', { name: 'Loading products' })).toBeInTheDocument()
    expect(await screen.findByRole('list', { name: 'Products' })).toBeInTheDocument()
  })

  it('shows an error with Try again, and recovers', async () => {
    setProductRequestsFailing(true)
    const user = userEvent.setup()
    renderApp()
    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load the products.')

    setProductRequestsFailing(false)
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('list', { name: 'Products' })).toBeInTheDocument()
  })

  it('shows an empty state when nothing matches', async () => {
    renderApp('/?search=no-such-thing')
    expect(await screen.findByText('No products match.')).toBeInTheDocument()
  })
})

describe('UI states on the details page', () => {
  it('shows a loading state, then the product', async () => {
    resetMockApi({ latency: 'normal' })
    renderApp('/products/prod-0001')
    expect(screen.getByRole('status', { name: 'Loading product' })).toBeInTheDocument()
    const name = findProduct('prod-0001')?.name ?? ''
    expect(await screen.findByRole('heading', { level: 1, name })).toBeInTheDocument()
  })

  it('shows an error with Try again, and recovers', async () => {
    setProductRequestsFailing(true)
    const user = userEvent.setup()
    renderApp('/products/prod-0001')
    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load this product.')

    setProductRequestsFailing(false)
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('shows a not-found message for an unknown product, without a retry', async () => {
    renderApp('/products/prod-9999')
    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t find that product.')
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse all products' })).toBeInTheDocument()
  })
})
