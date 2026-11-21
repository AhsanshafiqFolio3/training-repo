import type { ReactElement } from 'react'
import type { ErrorFallbackProps } from '../shared/error-boundary'

// The last line of defence, shown if something outside a page crashes (the header, the
// router). It can't rely on the router or the store, so it uses a plain link.
export function AppError({ reset }: ErrorFallbackProps): ReactElement {
  return (
    <main className="not-found page-container" role="alert">
      <span className="eyebrow">SOMETHING WENT WRONG</span>
      <h1>The Bug Bazaar hit a bug.</h1>
      <p>It has been logged. Try again, or reload the shop.</p>
      <div className="error-actions">
        <button type="button" className="button dark" onClick={reset}>
          Try again
        </button>
        <a className="button secondary" href={import.meta.env.BASE_URL}>
          Reload the shop
        </a>
      </div>
    </main>
  )
}
