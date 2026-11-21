import type { ApiRequestError } from '../api/ApiRequestError'

// One value describes a request at any moment. Because it is a union,
// "loading with data" or "error without an error object" can't be written.
export type RequestState<TData> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: TData }
  | { status: 'error'; error: ApiRequestError }
