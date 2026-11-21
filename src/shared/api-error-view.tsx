import type { ReactElement } from 'react'
import { Link, useLocation } from 'react-router'
import type { ApiRequestError } from '../api/api-request-error'
import { describeError, errorKind } from '../api/error-messages'
import { NotFoundContent } from './not-found-page'
import { ErrorState } from './status-views'

type ApiErrorViewProps = {
  error: ApiRequestError
  onRetry: () => void
  notFoundTitle?: string
}

// The standard way to show a failed request anywhere in the app.
export function ApiErrorView({ error, onRetry, notFoundTitle }: ApiErrorViewProps): ReactElement {
  const location = useLocation()
  const kind = errorKind(error)
  const { title, message, canRetry } = describeError(error)

  if (kind === 'not-found') return <NotFoundContent title={notFoundTitle} />

  return (
    <ErrorState title={title} message={message} onRetry={canRetry ? onRetry : undefined}>
      {kind === 'signed-out' && (
        <Link className="button dark" to="/login" state={{ from: location }}>
          Sign in
        </Link>
      )}
    </ErrorState>
  )
}
