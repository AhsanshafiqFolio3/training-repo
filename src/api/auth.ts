import { apiRequest } from './client'
import type { LoginRequest, LoginResponse, User } from './types'

export function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/login', { method: 'POST', body: credentials })
}

export function getCurrentUser(signal?: AbortSignal): Promise<User> {
  return apiRequest<User>('/me', { signal })
}
