import { beforeEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DEMO_USER, findProduct } from '../../mocks/mock-database'
import { readMockSettings, saveMockSettings } from '../../mocks/mock-settings'
import { countRequests, renderApp, resetMockApi, signedInState } from '../../test/render-app'

function currentUrl(): string {
  return screen.getByTestId('current-url').textContent ?? ''
}

async function fillLogin(email: string, password: string): Promise<void> {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Password'), password)
}

beforeEach(() => {
  resetMockApi()
})

describe('auth', () => {
  it('sends a signed-out user to login, then back to the page they wanted', async () => {
    const user = userEvent.setup()
    const product = findProduct('prod-0001')
    if (!product) throw new Error('seed data is missing prod-0001')
    renderApp('/checkout', { cart: { lines: [{ product, quantity: 1 }], checkoutKey: null } })

    expect(currentUrl()).toBe('/login')
    await fillLogin(DEMO_USER.email, DEMO_USER.password)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('heading', { name: 'Checkout' })).toBeInTheDocument()
    expect(currentUrl()).toBe('/checkout')
  })

  it('can’t be double-submitted', async () => {
    const user = userEvent.setup()
    renderApp('/login')
    await fillLogin(DEMO_USER.email, DEMO_USER.password)

    const button = screen.getByRole('button', { name: 'Sign in' })
    await user.dblClick(button)

    expect(await screen.findByRole('heading', { name: 'Your account' })).toBeInTheDocument()
    expect(countRequests('POST /api/login')).toBe(1)
  })

  it('shows field errors for a 400 and announces them', async () => {
    const user = userEvent.setup()
    renderApp('/login')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Please fix the fields below.')
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Enter your email address.')
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription('Enter your password.')
    expect(screen.getByLabelText('Email')).toBeInvalid()
  })

  it('shows our own message for a wrong password, not the server’s', async () => {
    const user = userEvent.setup()
    renderApp('/login')
    await fillLogin(DEMO_USER.email, 'not-my-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'That email and password don’t match.',
    )
    expect(screen.queryByText('Email or password is incorrect.')).not.toBeInTheDocument()
  })

  it('clears the session on a 401 and asks the user to sign in again', async () => {
    saveMockSettings({ ...readMockSettings(), rejectTokens: true })
    const { store } = renderApp('/account', signedInState())

    expect(await screen.findByText('Your session ended. Please sign in again.')).toBeInTheDocument()
    expect(currentUrl()).toBe('/login')
    expect(store.getState().session.token).toBeNull()
  })

  it('signs out from the account page', async () => {
    const user = userEvent.setup()
    const { store } = renderApp('/account', signedInState())
    expect(await screen.findByText(DEMO_USER.email)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(store.getState().session.token).toBeNull()
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
  })
})
