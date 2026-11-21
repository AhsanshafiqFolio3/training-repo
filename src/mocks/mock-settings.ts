// Switches that let us trigger slow responses and errors on purpose.
// They are saved in sessionStorage so they survive a page reload.

export const MOCK_LATENCIES = ['none', 'normal', 'slow', 'random'] as const
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

// How long the mock waits before answering, in milliseconds.
// 'random' gives every request its own delay, so a request sent later can
// finish first. That's how real networks behave, and what D2-6 guards against.
export function latencyMs(latency: MockLatency): number {
  switch (latency) {
    case 'none':
      return 0
    case 'normal':
      return 300
    case 'slow':
      return 2000
    case 'random':
      return 100 + Math.round(Math.random() * 1400)
  }
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
