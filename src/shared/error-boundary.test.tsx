import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './error-boundary'
import type { ErrorFallbackProps } from './error-boundary'

let shouldThrow = true
function Unstable(): ReactElement {
  if (shouldThrow) throw new Error('Render failed')
  return <p>Recovered content</p>
}
function Fallback({ reset }: ErrorFallbackProps): ReactElement {
  return (
    <button
      onClick={() => {
        shouldThrow = false
        reset()
      }}
    >
      Try again
    </button>
  )
}
afterEach(() => {
  vi.restoreAllMocks()
  shouldThrow = true
})
it('shows the fallback when a child throws and renders the children again after reset', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
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
