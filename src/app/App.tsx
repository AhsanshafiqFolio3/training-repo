import { useEffect } from 'react'
import type { ReactElement } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { CartProvider } from '../features/cart/CartProvider'
import { calculateTotals } from '../features/cart/cartLogic'
import { useCart } from '../features/cart/useCart'
import { ProductDetailsPage } from '../features/products/ProductDetailsPage'
import { ProductListPage } from '../features/products/ProductListPage'
import { USE_MOCK_API } from '../api/config'
import { MockControls } from '../mocks/MockControls'
import { ErrorBoundary } from '../shared/ErrorBoundary'
import type { ErrorFallbackProps } from '../shared/ErrorBoundary'

function PageError({ reset }: ErrorFallbackProps): ReactElement {
  return (
    <main className="not-found page-container" role="alert">
      <span className="eyebrow">SOMETHING WENT WRONG</span>
      <h1>
        This page hit
        <br />a bug.
      </h1>
      <p>Try loading it again, or head back to the shop.</p>
      <div className="error-actions">
        <button className="button dark" onClick={reset}>
          Try again
        </button>
        <Link className="button secondary" to="/">
          Back to the shop
        </Link>
      </div>
    </main>
  )
}

function ScrollOnNavigate({ hash }: { hash: string }): null {
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    const frame = requestAnimationFrame(() =>
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }),
    )
    return (): void => {
      cancelAnimationFrame(frame)
    }
  }, [hash])
  return null
}
function Shell(): ReactElement {
  const { items } = useCart()
  const { pathname, hash } = useLocation()
  return (
    <>
      <ScrollOnNavigate key={pathname} hash={hash} />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="header">
        <Link to="/" className="brand" aria-label="The Bug Bazaar home">
          The Bug Bazaar
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            Shop
          </NavLink>
        </nav>
        <Link className="header-bag" to="/#bag">
          <ShoppingBag size={17} />
          <span>Your cart</span>
          <span className="header-count">{calculateTotals(items).count}</span>
        </Link>
      </header>
      <div id="main-content" tabIndex={-1}>
        <ErrorBoundary key={pathname} fallback={PageError}>
          <Routes>
            <Route path="/" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailsPage />} />
            <Route
              path="*"
              element={
                <main className="not-found page-container">
                  <title>Page not found · The Bug Bazaar</title>
                  <span className="eyebrow">404 / PAGE NOT FOUND</span>
                  <h1>
                    This page
                    <br />
                    wandered off.
                  </h1>
                  <p>We couldn’t find that page. Let’s get you back to the shop.</p>
                  <Link className="button dark" to="/">
                    Back to the shop <ArrowRight size={17} />
                  </Link>
                </main>
              }
            />
          </Routes>
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
export default function App(): ReactElement {
  return (
    <CartProvider>
      <Shell />
    </CartProvider>
  )
}
