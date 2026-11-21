import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, renderHook } from '@testing-library/react'
import { useDebouncedValue } from './use-debounced-value'
import { useEventListener } from './use-event-listener'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useDebouncedValue', () => {
  it('only updates after the value stops changing for the delay', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'd' },
    })

    rerender({ value: 'du' })
    act(() => vi.advanceTimersByTime(200))
    rerender({ value: 'duck' })
    act(() => vi.advanceTimersByTime(200))
    // 400 ms have passed, but never 300 ms without a change.
    expect(result.current).toBe('d')

    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBe('duck')
  })
})

describe('useEventListener', () => {
  it('calls the latest handler and stops listening on unmount', () => {
    const first = vi.fn<(event: UIEvent) => void>()
    const second = vi.fn<(event: UIEvent) => void>()
    const { rerender, unmount } = renderHook(({ handler }) => useEventListener('resize', handler), {
      initialProps: { handler: first },
    })

    rerender({ handler: second })
    fireEvent(window, new Event('resize'))
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)

    unmount()
    fireEvent(window, new Event('resize'))
    expect(second).toHaveBeenCalledTimes(1)
  })
})
