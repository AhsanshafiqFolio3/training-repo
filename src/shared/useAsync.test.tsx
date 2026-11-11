import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAsync } from './useAsync'

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
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
    const { result, rerender } = renderHook(({ loader }) => useAsync(loader), {
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
  it('exposes a rejected load as an error and supports a fresh loader for retry', async () => {
    const failed = (): Promise<string> => Promise.reject(new Error('Offline'))
    const { result, rerender } = renderHook(({ loader }) => useAsync(loader), {
      initialProps: { loader: failed },
    })
    await waitFor(() => expect(result.current).toEqual({ status: 'error', message: 'Offline' }))
    rerender({ loader: (): Promise<string> => Promise.resolve('Recovered') })
    await waitFor(() => expect(result.current).toEqual({ status: 'success', data: 'Recovered' }))
  })
})
