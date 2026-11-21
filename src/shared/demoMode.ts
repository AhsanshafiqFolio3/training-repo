import type { DemoMode } from './types'

export function demoControlsEnabled(): boolean {
  return import.meta.env.DEV || import.meta.env.VITE_DEMO_CONTROLS === 'true'
}
export function readDemoMode(value: string | null): DemoMode {
  if (!demoControlsEnabled()) return 'success'
  return value === 'slow' || value === 'empty' || value === 'error' ? value : 'success'
}
export function withoutParam(params: URLSearchParams, key: string): URLSearchParams {
  const next = new URLSearchParams(params)
  next.delete(key)
  return next
}
