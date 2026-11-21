import type { ReactElement, ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAppSelector } from '../../store/hooks'
import { selectIsSignedIn } from './session-slice'

// Wraps pages that need a signed-in user. Anyone else goes to /login, and the page
// they wanted travels along in the navigation state, so login can send them back.
export function RequireAuth({ children }: { children: ReactNode }): ReactElement {
  const isSignedIn = useAppSelector(selectIsSignedIn)
  const location = useLocation()

  if (!isSignedIn) return <Navigate to="/login" replace state={{ from: location }} />
  return <>{children}</>
}
