import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router'
import App from './app/app'
import { AppError } from './app/app-error'
import { ErrorBoundary } from './shared/error-boundary'
import { listenForUncaughtErrors } from './shared/monitoring'
import { loadPersistedState } from './store/persistence'
import { createAppStore } from './store/store'
import './styles/index.css'

// Log errors that React can't catch (event handlers, timers, forgotten promises).
listenForUncaughtErrors()

const store = createAppStore(loadPersistedState())

const root = document.getElementById('root')
if (!root) throw new Error('Root element missing')
createRoot(root).render(
  <StrictMode>
    <ErrorBoundary fallback={AppError}>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
)
