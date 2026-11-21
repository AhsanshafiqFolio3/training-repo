// Switches that let us trigger slow responses and errors on purpose.
// They are saved in sessionStorage so they survive a page reload.

export const MOCK_LATENCIES = ['none', 'normal', 'slow'] as const
export type MockLatency = (typeof MOCK_LATENCIES)[number]

export type MockSettings = {
  latency: MockLatency
  // Product requests answer 500 instead of data.
  failProductRequests: boolean
  // Every token is treated as expired, so protected requests answer 401.
  rejectTokens: boolean
}

export const DEFAULT_MOCK_SETTINGS: MockSettings = {
  latency: 'normal',
  failProductRequests: false,
  rejectTokens: false,
}

const STORAGE_KEY = 'bug-bazaar:mock-settings'

export const LATENCY_MS: Record<MockLatency, number> = {
  none: 0,
  normal: 300,
  slow: 2000,
}

export function readMockSettings(): MockSettings {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (!saved) return DEFAULT_MOCK_SETTINGS
    return { ...DEFAULT_MOCK_SETTINGS, ...(JSON.parse(saved) as Partial<MockSettings>) }
  } catch {
    return DEFAULT_MOCK_SETTINGS
  }
}

export function saveMockSettings(settings: MockSettings): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Storage can be blocked (private mode). The settings then last until reload.
  }
}
