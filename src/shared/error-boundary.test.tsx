import type { ReactElement } from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../app/app'
import { CRASH_EVENT } from '../mocks/mock-settings'
import { createAppStore } from '../store/store'
import { resetMockApi } from '../test/render-app'
import { ErrorBoundary } from './error-boundary'
import type { ErrorFallbackProps } from './error-boundary'
import { clearErrorReports, listenForUncaughtErrors, readErrorReports } from './monitoring'

let shouldThrow = true

function Unstable(): ReactElement {
  if (shouldThrow) throw new Error('Render failed')
  return <p>Recovered content</p>
}

function Fallback({ reset }: ErrorFallbackProps): ReactElement {
  return (
    <button
      type="button"
      onClick={() => {
        shouldThrow = false
        reset()
      }}
    >
      Try again
    </button>
  )
}

beforeEach(() => {
  resetMockApi()
  clearErrorReports()
  // React and our logger both print the error; keep the test output readable.
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
  shouldThrow = true
})

describe('error boundary', () => {
  it('shows the fallback when a child throws, and the children again after reset', async () => {
    const user = userEvent.setup()
    render(
      <ErrorBoundary fallback={Fallback}>
        <Unstable />
      </ErrorBoundary>,
    )
    expect(screen.queryByText('Recovered content')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.getByText('Recovered content')).toBeInTheDocument()
  })

  it('logs the error with the components it came through', () => {
    render(
      <ErrorBoundary fallback={Fallback}>
        <Unstable />
      </ErrorBoundary>,
    )
    const [report] = readErrorReports()
    expect(report).toMatchObject({ source: 'render', message: 'Error: Render failed' })
    expect(report?.componentStack).toContain('Unstable')
  })

  it('replaces only the crashed page; the header and other pages keep working', async () => {
    const user = userEvent.setup()
    render(
      <Provider store={createAppStore()}>
        <MemoryRouter initialEntries={['/cart']}>
          <App />
        </MemoryRouter>
      </Provider>,
    )
    await screen.findByRole('heading', { level: 1 })

    act(() => {
      window.dispatchEvent(new Event(CRASH_EVENT))
    })
    expect(screen.getByRole('heading', { name: 'This page hit a bug.' })).toBeInTheDocument()
    expect(readErrorReports()).toHaveLength(1)

    // The header still works, and the next page renders normally.
    await user.click(screen.getByRole('link', { name: 'Shop' }))
    expect(await screen.findByRole('heading', { name: 'All products' })).toBeInTheDocument()
  })
})

describe('uncaught errors', () => {
  it('logs errors that happen outside React rendering', () => {
    const stopListening = listenForUncaughtErrors()
    try {
      window.dispatchEvent(
        new ErrorEvent('error', { error: new Error('Timer broke'), message: 'Timer broke' }),
      )
    } finally {
      stopListening()
    }
    expect(readErrorReports()).toEqual([
      expect.objectContaining({ source: 'uncaught', message: 'Error: Timer broke' }),
    ])
  })
})
