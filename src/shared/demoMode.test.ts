import { afterEach, describe, expect, it, vi } from 'vitest'
import { readDemoMode, withoutParam } from './demoMode'

afterEach(() => {
  vi.unstubAllEnvs()
})
describe('demo controls', () => {
  it('reads known demo states and falls back to success', () => {
    expect(readDemoMode('error')).toBe('error')
    expect(readDemoMode('slow')).toBe('slow')
    expect(readDemoMode('nonsense')).toBe('success')
    expect(readDemoMode(null)).toBe('success')
  })
  it('ignores demo switches in a production build unless they are opted in', () => {
    vi.stubEnv('DEV', false)
    expect(readDemoMode('error')).toBe('success')
    vi.stubEnv('VITE_DEMO_CONTROLS', 'true')
    expect(readDemoMode('error')).toBe('error')
  })
  it('removes only the requested query parameter', () => {
    const next = withoutParam(new URLSearchParams('state=error&tab=all'), 'state')
    expect(next.toString()).toBe('tab=all')
  })
})
