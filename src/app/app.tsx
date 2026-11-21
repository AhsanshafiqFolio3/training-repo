import { useEffect } from 'react'
import type { ReactElement } from 'react'
import { Link, useLocation } from 'react-router'
import { USE_MOCK_API } from '../api/config'
import { CrashTrigger } from '../mocks/crash-trigger'
import { MockControls } from '../mocks/mock-controls'
import { ErrorBoundary } from '../shared/error-boundary'
import type { ErrorFallbackProps } from '../shared/error-boundary'
import { AppRoutes } from './app-routes'
import { SiteHeader } from './site-header'

function PageError({ reset }: ErrorFallbackProps): ReactElement {
  return (
    <main className="not-found page-container" role="alert">
      <span className="eyebrow">SOMETHING WENT WRONG</span>
      <h1>This page hit a bug.</h1>
      <p>Try loading it again, or head back to the shop.</p>
      <div className="error-actions">
        <button type="button" className="button dark" onClick={reset}>
          Try again
        </button>
        <Link className="button secondary" to="/">
          Back to the shop
        </Link>
      </div>
    </main>
  )
}

// A new page should start at the top, like a normal page load. App gives this a new
// key on every path change, so it mounts again and the effect runs once per page.
function ScrollToTop(): null {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return null
}

export default function App(): ReactElement {
  const { pathname } = useLocation()
  return (
    <>
      <ScrollToTop key={pathname} />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader />
      <div id="main-content" tabIndex={-1}>
        {/* A crash inside a page replaces only the page, not the header or footer.
            The key resets the boundary when you go to another page. */}
        <ErrorBoundary key={pathname} fallback={PageError}>
          <AppRoutes />
          {USE_MOCK_API && <CrashTrigger />}
        </ErrorBoundary>
      </div>
      <footer className="footer">
        <Link to="/" className="brand">
          The Bug Bazaar
        </Link>
        <p>Developer gear: rubber ducks, mechanical keyboards, coffee and stickers.</p>
      </footer>
      {USE_MOCK_API && <MockControls />}
    </>
  )
}
