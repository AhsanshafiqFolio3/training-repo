import { render } from '@testing-library/react'
import type { RenderResult } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { CartProvider } from '../features/cart/CartProvider'
import { ProductDetailsPage } from '../features/products/ProductDetailsPage'
import { ProductListPage } from '../features/products/ProductListPage'
import { resetMockDatabase } from '../mocks/mockDatabase'
import { DEFAULT_MOCK_SETTINGS, saveMockSettings } from '../mocks/mockSettings'
import type { MockSettings } from '../mocks/mockSettings'

// Fresh mock data with instant responses, unless a test asks for something else.
export function resetMockApi(settings: Partial<MockSettings> = {}): void {
  sessionStorage.clear()
  resetMockDatabase()
  saveMockSettings({ ...DEFAULT_MOCK_SETTINGS, latency: 'none', ...settings })
}

// Renders the real pages and routes at the given URL, backed by the mock API.
export function renderApp(url = '/'): RenderResult {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <CartProvider>
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
        </Routes>
      </CartProvider>
    </MemoryRouter>,
  )
}
