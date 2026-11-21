import type { ReactElement } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { ShoppingBag, User } from 'lucide-react'
import { selectCartCount } from '../features/cart/cart-slice'
import { selectIsSignedIn } from '../features/session/session-slice'
import { useAppSelector } from '../store/hooks'

export function SiteHeader(): ReactElement {
  // A derived value from a selector: the badge never stores its own count.
  const cartCount = useAppSelector(selectCartCount)
  const isSignedIn = useAppSelector(selectIsSignedIn)
  const location = useLocation()

  return (
    <header className="header">
      <Link to="/" className="brand">
        The Bug Bazaar
      </Link>
      <nav aria-label="Main navigation">
        <NavLink to="/" end>
          Shop
        </NavLink>
        {isSignedIn ? (
          <NavLink to="/account">
            <User size={15} aria-hidden="true" /> Account
          </NavLink>
        ) : (
          <NavLink to="/login" state={{ from: location }}>
            Sign in
          </NavLink>
        )}
      </nav>
      <Link className="header-bag" to="/cart">
        <ShoppingBag size={17} aria-hidden="true" />
        <span>Cart</span>
        <span className="header-count" aria-label={`${cartCount} items in cart`}>
          {cartCount}
        </span>
      </Link>
    </header>
  )
}
