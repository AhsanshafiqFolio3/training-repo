import type { ReactElement, ReactNode } from 'react'
import type { ApiRequestError } from '../api/ApiRequestError'
import type { RequestState } from './requestState'

type AsyncContentProps<TData> = {
  state: RequestState<TData>
  loading: ReactNode
  error: (error: ApiRequestError) => ReactNode
  // Optional: decides when successful data counts as "nothing to show".
  isEmpty?: (data: TData) => boolean
  empty?: ReactNode
  children: (data: TData) => ReactNode
}

// Picks the right view for each request state. Every page that loads data uses
// it, so loading, error, empty and success are always handled the same way.
export function AsyncContent<TData>({
  state,
  loading,
  error,
  isEmpty,
  empty,
  children,
}: AsyncContentProps<TData>): ReactElement {
  switch (state.status) {
    case 'idle':
    case 'loading':
      return <>{loading}</>
    case 'error':
      return <>{error(state.error)}</>
    case 'success':
      return <>{isEmpty?.(state.data) ? empty : children(state.data)}</>
  }
}
