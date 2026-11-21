import { useCallback } from 'react'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router'
import { getCurrentUser } from '../../api/auth'
import { ApiErrorView } from '../../shared/api-error-view'
import { AsyncContent } from '../../shared/async-content'
import { LoadingDetails } from '../../shared/status-views'
import { useAsync } from '../../shared/use-async'
import { useAppDispatch } from '../../store/hooks'
import { signedOut } from './session-slice'

export function AccountPage(): ReactElement {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  // Ask the server who we are. If the token has expired this gets a 401,
  // the session is cleared, and RequireAuth sends us to the login page.
  const loadUser = useCallback((signal: AbortSignal) => getCurrentUser(signal), [])
  const [userState, retry] = useAsync(loadUser)

  function signOut(): void {
    dispatch(signedOut())
    void navigate('/')
  }

  return (
    <main className="page-container narrow-page">
      <title>Your account · The Bug Bazaar</title>
      <h1>Your account</h1>
      <AsyncContent
        state={userState}
        loading={<LoadingDetails label="Loading your account" />}
        error={(error) => <ApiErrorView error={error} onRetry={retry} />}
      >
        {(user) => (
          <dl className="account-details">
            <dt>Name</dt>
            <dd>{user.name}</dd>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </dl>
        )}
      </AsyncContent>
      <button type="button" className="button secondary" onClick={signOut}>
        Sign out
      </button>
    </main>
  )
}
