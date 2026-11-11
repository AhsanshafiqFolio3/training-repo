import { useEffect } from 'react'
import type { ReactElement } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router'
import { ArrowUpRight, ArrowRight, ShoppingBag } from 'lucide-react'
import { Store } from '../features/store/Store'
import { CartProvider, useCart } from '../features/store/CartContext'
import { calculateTotals } from '../features/store/logic'
import { CustomerProvider } from '../features/customers/CustomerContext'
import { Customers } from '../features/customers/Customers'
import { CustomerDetail } from '../features/customers/CustomerDetail'
import { Guide } from '../features/Guide'

function Shell(): ReactElement {
  const { items } = useCart()
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash)
      requestAnimationFrame(() =>
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }),
      )
    else window.scrollTo(0, 0)
    document.title = `${pathname.startsWith('/customers') ? 'Customer workspace' : pathname === '/project' ? 'Project guide' : 'Everyday, considered.'} — Form`
  }, [pathname, hash])
  return (
    <>
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
