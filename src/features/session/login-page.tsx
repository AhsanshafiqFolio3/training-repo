import { useRef, useState } from 'react'
import type { FormEvent, ReactElement } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { toApiRequestError } from '../../api/api-request-error'
import type { ApiRequestError } from '../../api/api-request-error'
import { login } from '../../api/auth'
import { describeError, errorKind, fieldErrorsOf } from '../../api/error-messages'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectHasSessionExpired, signedIn } from './session-slice'

// RequireAuth puts the page the user wanted in location.state.from.
function readReturnPath(state: unknown): string {
  if (typeof state !== 'object' || state === null) return '/account'
  const from: unknown = Reflect.get(state, 'from')
  if (typeof from !== 'object' || from === null) return '/account'
  const pathname: unknown = Reflect.get(from, 'pathname')
  const search: unknown = Reflect.get(from, 'search')
  return typeof pathname === 'string'
    ? pathname + (typeof search === 'string' ? search : '')
    : '/account'
}

function formMessage(error: ApiRequestError): string {
  if (error.code === 'INVALID_CREDENTIALS') return 'That email and password don’t match.'
  if (errorKind(error) === 'invalid-input') return 'Please fix the fields below.'
  return describeError(error).message
}

export function LoginPage(): ReactElement {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const hasSessionExpired = useAppSelector(selectHasSessionExpired)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<ApiRequestError | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // State updates wait for the next render, so two very fast clicks could both see
  // isSubmitting === false. A ref changes immediately, which closes that gap.
  const isSubmittingRef = useRef(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await login({ email, password })
      dispatch(signedIn(response))
      void navigate(readReturnPath(location.state), { replace: true })
    } catch (caught) {
      setError(toApiRequestError(caught))
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  const fieldErrors = error ? fieldErrorsOf(error) : {}

  return (
    <main className="page-container narrow-page">
      <title>Sign in · The Bug Bazaar</title>
      <h1>Sign in</h1>
      {hasSessionExpired && !error && (
        <p className="form-notice" role="status">
          Your session ended. Please sign in again.
        </p>
      )}
      <form className="form" noValidate onSubmit={(event) => void handleSubmit(event)}>
        {/* role="alert" makes screen readers announce the problem as soon as it appears. */}
        <div role="alert" className="form-error">
          {error && formMessage(error)}
        </div>

        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={fieldErrors.email ? true : undefined}
          aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
        />
        {fieldErrors.email && (
          <p id="login-email-error" className="field-error">
            {fieldErrors.email}
          </p>
        )}

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={fieldErrors.password ? true : undefined}
          aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
        />
        {fieldErrors.password && (
          <p id="login-password-error" className="field-error">
            {fieldErrors.password}
          </p>
        )}

        <button type="submit" className="button dark" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="form-hint">
        Demo account: <code>ada@bugbazaar.dev</code> / <code>debug123</code>
      </p>
    </main>
  )
}
