import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router'
import App from './app/app'
import { loadPersistedState } from './store/persistence'
import { createAppStore } from './store/store'
import './styles/index.css'

const store = createAppStore(loadPersistedState())

const root = document.getElementById('root')
if (!root) throw new Error('Root element missing')
createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
