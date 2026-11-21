import type { ReactElement } from 'react'
import { Route, Routes } from 'react-router'
import { CartPage } from '../features/cart/cart-page'
import { CheckoutPage } from '../features/checkout/checkout-page'
import { OrderConfirmationPage } from '../features/orders/order-confirmation-page'
import { ProductDetailsPage } from '../features/products/product-details-page'
import { ProductListPage } from '../features/products/product-list-page'
import { AccountPage } from '../features/session/account-page'
import { LoginPage } from '../features/session/login-page'
import { RequireAuth } from '../features/session/require-auth'
import { NotFoundPage } from '../shared/not-found-page'

// Every page of the store. Tests render this same component, so they use the real routes.
export function AppRoutes(): ReactElement {
  return (
    <Routes>
      <Route path="/" element={<ProductListPage />} />
      <Route path="/products/:id" element={<ProductDetailsPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/checkout"
        element={
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <RequireAuth>
            <OrderConfirmationPage />
          </RequireAuth>
        }
      />
      <Route
        path="/account"
        element={
          <RequireAuth>
            <AccountPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
