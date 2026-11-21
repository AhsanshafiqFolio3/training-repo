import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { configureApiClient } from '../api/client'
import { cartReducer } from '../features/cart/cart-slice'
import { sessionExpired, sessionReducer } from '../features/session/session-slice'
import { saveCart, saveSession } from './persistence'

const rootReducer = combineReducers({
  cart: cartReducer,
  session: sessionReducer,
})

export type RootState = ReturnType<typeof rootReducer>

// A function rather than one shared store, so each test can start from a fresh store.
// main.tsx passes in whatever was saved in storage last time.
export function createAppStore(preloadedState?: Partial<RootState>) {
  const store = configureStore({ reducer: rootReducer, preloadedState })

  // Save the cart and session whenever they change. Reducers return a new object
  // only when something changed, so comparing references is enough.
  let { cart: savedCart, session: savedSession } = store.getState()
  store.subscribe(() => {
    const { cart, session } = store.getState()
    if (cart !== savedCart) saveCart(cart)
    if (session !== savedSession) saveSession(session)
    savedCart = cart
    savedSession = session
  })

  // The API client reads the token from here, and tells us when the server rejects it.
  configureApiClient({
    getToken: () => store.getState().session.token,
    onUnauthorized: () => store.dispatch(sessionExpired()),
  })

  return store
}

export type AppStore = ReturnType<typeof createAppStore>
export type AppDispatch = AppStore['dispatch']
