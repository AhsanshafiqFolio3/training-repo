import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import type { RenderResult } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, useLocation, useNavigate } from 'react-router'
import { AppRoutes } from '../app/app-routes'
import { SiteHeader } from '../app/site-header'
import { DEMO_USER, mockDatabase, resetMockDatabase } from '../mocks/mock-database'
import { DEFAULT_MOCK_SETTINGS, saveMockSettings } from '../mocks/mock-settings'
import type { MockSettings } from '../mocks/mock-settings'
import { clearCache } from '../shared/request-cache'
import { createAppStore } from '../store/store'
import type { AppStore, RootState } from '../store/store'

// Fresh mock data with instant responses, unless a test asks for something else.
export function resetMockApi(settings: Partial<MockSettings> = {}): void {
  sessionStorage.clear()
  localStorage.clear()
  clearCache()
  resetMockDatabase()
  saveMockSettings({ ...DEFAULT_MOCK_SETTINGS, latency: 'none', ...settings })
}

// Shows the current URL and stands in for the browser's Back button.
function HistoryControls(): ReactElement {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <>
      <output data-testid="current-url">{location.pathname + location.search}</output>
      <button type="button" onClick={() => void navigate(-1)}>
        Browser back
      </button>
    </>
  )
}

type RenderAppResult = RenderResult & { store: AppStore }

// Renders the real pages and routes at the given URL, with a fresh Redux store,
// backed by the mock API.
export function renderApp(url = '/', preloadedState?: Partial<RootState>): RenderAppResult {
  const store = createAppStore(preloadedState)
  const result = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[url]}>
        <SiteHeader />
        <AppRoutes />
        <HistoryControls />
      </MemoryRouter>
    </Provider>,
  )
  return { ...result, store }
}

// A Redux state for a user who is already signed in with a valid mock token.
export function signedInState(): Partial<RootState> {
  return {
    session: {
      token: `mock-token.${DEMO_USER.id}.${Date.now() + 60 * 60 * 1000}`,
      user: { id: DEMO_USER.id, name: DEMO_USER.name, email: DEMO_USER.email },
      hasExpired: false,
    },
  }
}

// How many times the mock received exactly this request, e.g. 'POST /api/orders'.
export function countRequests(request: string): number {
  return mockDatabase.requestLog.filter((entry) => entry === request).length
}
