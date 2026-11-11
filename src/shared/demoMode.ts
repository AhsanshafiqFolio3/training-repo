import type { DemoMode } from './types'

export function readDemoMode(value: string | null): DemoMode {
  return value === 'slow' || value === 'empty' || value === 'error' ? value : 'success'
}
