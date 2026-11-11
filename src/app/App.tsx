import { useEffect } from 'react'
import type { ReactElement } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router'
import { ArrowUpRight, ArrowRight, ShoppingBag } from 'lucide-react'
import { Store } from '../features/store/Store'
import { CartProvider } from '../features/store/CartProvider'
import { useCart } from '../features/store/useCart'
import { calculateTotals } from '../features/store/logic'
import { CustomerProvider } from '../features/customers/CustomerProvider'
import { Customers } from '../features/customers/Customers'
import { CustomerDetail } from '../features/customers/CustomerDetail'
import { Guide } from '../features/Guide'
import { ErrorBoundary } from '../shared/ErrorBoundary'
import type { ErrorFallbackProps } from '../shared/ErrorBoundary'

function PageError({ reset }: ErrorFallbackProps): ReactElement {
  return (
    <main className="not-found page-container" role="alert">
      <span className="eyebrow">SOMETHING WENT WRONG</span>
      <h1>
        This page hit
        <br />a snag.
      </h1>
      <p>Try loading it again, or head back to the collection.</p>
      <div className="error-actions">
        <button className="button dark" onClick={reset}>
          Try again
        </button>
        <Link className="button secondary" to="/">
          Back to the collection
        </Link>
      </div>
    </main>
  )
}

function pageTitle(pathname: string): string {
  if (pathname.startsWith('/customers')) return 'Customer workspace — Form'
  if (pathname === '/project') return 'Project guide — Form'
  return 'Everyday, considered. — Form'
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
      <title>{pageTitle(pathname)}</title>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="announcement">
        <span>
          <span className="announcement-dot" /> GOOD THINGS, THOUGHTFULLY CHOSEN.
        </span>
        <span>
          10% off above Rs. 5,000 <ArrowUpRight size={13} />
        </span>
      </div>
      <header className="header">
        <Link to="/" className="brand" aria-label="Form home">
          form<span>®</span>
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            The collection
          </NavLink>
          <NavLink to="/customers">Customer workspace</NavLink>
          <NavLink to="/project">
            Project guide <ArrowUpRight size={12} />
          </NavLink>
        </nav>
        <Link className="header-bag" to="/#bag">
          <ShoppingBag size={17} />
          <span>Your bag</span>
          <span className="header-count">{calculateTotals(items).count}</span>
        </Link>
      </header>
      <div id="main-content" tabIndex={-1}>
        <ErrorBoundary key={pathname} fallback={PageError}>
          <Routes>
            <Route path="/" element={<Store />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/project" element={<Guide />} />
            <Route
              path="*"
              element={
                <main className="not-found page-container">
                  <span className="eyebrow">404 / A LITTLE OFF TRACK</span>
                  <h1>
                    Good things are
                    <br />
                    this way.
                  </h1>
                  <p>We couldn’t find that page. Let’s get you back to the everyday.</p>
                  <Link className="button dark" to="/">
                    Back to the collection <ArrowRight size={17} />
                  </Link>
                </main>
              }
            />
          </Routes>
        </ErrorBoundary>
      </div>
      <footer className="footer">
        <div>
          <Link to="/" className="brand">
            form<span>®</span>
          </Link>
          <p>Everyday, considered.</p>
        </div>
        <span>Thoughtful tech. A little more joy.</span>
        <Link to="/project">
          Made with purpose <ArrowUpRight size={14} />
        </Link>
      </footer>
    </>
  )
}
export default function App(): ReactElement {
  return (
    <CartProvider>
      <CustomerProvider>
        <Shell />
      </CustomerProvider>
    </CartProvider>
  )
}
