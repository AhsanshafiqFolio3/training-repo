import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { LoginResponse, User } from '../../api/types'

export type SessionState = {
  token: string | null
  user: User | null
  // true after the server rejected our token, so the login page can say why.
  hasExpired: boolean
}

const initialState: SessionState = { token: null, user: null, hasExpired: false }

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    signedIn(_state, action: PayloadAction<LoginResponse>) {
      return { token: action.payload.token, user: action.payload.user, hasExpired: false }
    },
    signedOut() {
      return initialState
    },
    // Any 401 on a request that sent a token lands here (see src/store/store.ts).
    sessionExpired() {
      return { ...initialState, hasExpired: true }
    },
  },
})

export const { signedIn, signedOut, sessionExpired } = sessionSlice.actions
export const sessionReducer = sessionSlice.reducer

type StateWithSession = { session: SessionState }

export const selectUser = (state: StateWithSession): User | null => state.session.user
export const selectIsSignedIn = (state: StateWithSession): boolean => state.session.token !== null
export const selectHasSessionExpired = (state: StateWithSession): boolean =>
  state.session.hasExpired
