import type { CartState } from '../features/cart/cart-slice'
import type { SessionState } from '../features/session/session-slice'

// The cart goes in localStorage: it should still be there tomorrow, in any tab.
// The session goes in sessionStorage: it ends when the tab closes. See docs/auth.md.
const CART_KEY = 'bug-bazaar:cart'
const SESSION_KEY = 'bug-bazaar:session'

type PersistedState = {
  cart?: CartState
  session?: SessionState
}

function readJson(storage: Storage, key: string): unknown {
  try {
    const saved = storage.getItem(key)
    return saved ? JSON.parse(saved) : undefined
  } catch {
    // Blocked storage or broken JSON: start empty rather than crash.
    return undefined
  }
}

function writeJson(storage: Storage, key: string, value: unknown): void {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be full or blocked. The app still works, it just won't remember.
  }
}

// Saved data can be old or edited by hand, so check its shape before trusting it.
function isCartState(value: unknown): value is CartState {
  if (typeof value !== 'object' || value === null) return false
  const lines: unknown = Reflect.get(value, 'lines')
  const checkoutKey: unknown = Reflect.get(value, 'checkoutKey')
  return Array.isArray(lines) && (checkoutKey === null || typeof checkoutKey === 'string')
}

function isSessionState(value: unknown): value is SessionState {
  if (typeof value !== 'object' || value === null) return false
  const token: unknown = Reflect.get(value, 'token')
  const user: unknown = Reflect.get(value, 'user')
  return typeof token === 'string' && typeof user === 'object' && user !== null
}

export function loadPersistedState(): PersistedState {
  const cart = readJson(localStorage, CART_KEY)
  const session = readJson(sessionStorage, SESSION_KEY)
  return {
    cart: isCartState(cart) ? cart : undefined,
    session: isSessionState(session) ? session : undefined,
  }
}

export function saveCart(cart: CartState): void {
  writeJson(localStorage, CART_KEY, cart)
}

export function saveSession(session: SessionState): void {
  if (session.token) writeJson(sessionStorage, SESSION_KEY, session)
  else sessionStorage.removeItem(SESSION_KEY)
}
