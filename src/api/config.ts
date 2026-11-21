// Read from .env files. See .env.example and the README.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// There is no real backend yet, so the mock API is on unless turned off.
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'
