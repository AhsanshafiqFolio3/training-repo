import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAsync } from './use-async'

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}
function failed(): Promise<string> {
  return Promise.reject(new Error('Offline'))
}
describe('async loading and race prevention', () => {
  it('does not let an older response overwrite a newer selection even if transport ignores abort', async () => {
    const old = deferred<string>(),
      recent = deferred<string>()
    let oldSignal: AbortSignal | undefined
    const first = (signal: AbortSignal): Promise<string> => {
      oldSignal = signal
      return old.promise
    }
    const second = (): Promise<string> => recent.promise
    const { result, rerender } = renderHook(({ loader }) => useAsync(loader)[0], {
      initialProps: { loader: first },
    })
    expect(result.current.status).toBe('loading')
    rerender({ loader: second })
    expect(oldSignal?.aborted).toBe(true)
    await act(async () => {
      recent.resolve('Omar')
    })
    await waitFor(() => expect(result.current).toEqual({ status: 'success', data: 'Omar' }))
    await act(async () => {
      old.resolve('Ayesha')
    })
    expect(result.current).toEqual({ status: 'success', data: 'Omar' })
  })
  it('exposes a rejected load as an error and supports a fresh loader', async () => {
    const { result, rerender } = renderHook(({ loader }) => useAsync(loader)[0], {
      initialProps: { loader: failed },
    })
    await waitFor(() =>
      expect(result.current).toMatchObject({ status: 'error', error: { message: 'Offline' } }),
    )
    rerender({ loader: (): Promise<string> => Promise.resolve('Recovered') })
    await waitFor(() => expect(result.current).toEqual({ status: 'success', data: 'Recovered' }))
  })
  it('retries the same loader and shows loading while the retry is pending', async () => {
    let calls = 0
    const retryLater = deferred<string>()
    const loader = (): Promise<string> =>
      ++calls === 1 ? Promise.reject(new Error('Offline')) : retryLater.promise
    const { result } = renderHook(() => useAsync(loader))
    await waitFor(() =>
      expect(result.current[0]).toMatchObject({ status: 'error', error: { message: 'Offline' } }),
    )
    act(() => {
      result.current[1]()
    })
    expect(result.current[0]).toEqual({ status: 'loading' })
    await act(async () => {
      retryLater.resolve('Recovered')
    })
    expect(result.current[0]).toEqual({ status: 'success', data: 'Recovered' })
    expect(calls).toBe(2)
  })
})
