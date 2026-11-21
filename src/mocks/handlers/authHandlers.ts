import type { LoginResponse, User } from '../../api/types'
import { mockDatabase } from '../mockDatabase'
import type { StoredUser } from '../mockDatabase'
import { errorResponse, jsonResponse } from '../mockResponses'
import { readMockSettings } from '../mockSettings'
import type { MockRequest } from '../mockRequest'

const TOKEN_PREFIX = 'mock-token'
const TOKEN_LIFETIME_MS = 60 * 60 * 1000

// A real server would sign its tokens. The mock only needs to know who the
// token belongs to and when it expires: "mock-token.<userId>.<expiresAt>".
function createToken(userId: string): string {
  return `${TOKEN_PREFIX}.${userId}.${Date.now() + TOKEN_LIFETIME_MS}`
}

function toPublicUser({ id, name, email }: StoredUser): User {
  return { id, name, email }
}

function unauthorized(): Response {
  return errorResponse(401, 'UNAUTHORIZED', 'Your session has expired. Please sign in again.')
}

// Returns the signed-in user, or a 401 response to send back instead.
export function authenticate(request: MockRequest): StoredUser | Response {
  if (readMockSettings().rejectTokens) return unauthorized()

  const header = request.headers.get('Authorization') ?? ''
  const [prefix, userId, expiresAt] = header.replace(/^Bearer /, '').split('.')
  const user = mockDatabase.users.find((candidate) => candidate.id === userId)
  const isValid = prefix === TOKEN_PREFIX && user && Number(expiresAt) > Date.now()
  return isValid ? user : unauthorized()
}

function readText(body: unknown, field: string): string {
  if (typeof body !== 'object' || body === null || !(field in body)) return ''
  const value: unknown = Reflect.get(body, field)
  return typeof value === 'string' ? value.trim() : ''
}

// POST /api/login
export function login({ body }: MockRequest): Response {
  const email = readText(body, 'email')
  const password = readText(body, 'password')

  const fieldErrors: Record<string, string> = {}
  if (!email) fieldErrors.email = 'Enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = 'Enter a valid email.'
  if (!password) fieldErrors.password = 'Enter your password.'
  if (Object.keys(fieldErrors).length > 0) {
    return errorResponse(400, 'VALIDATION_ERROR', 'Some fields need attention.', fieldErrors)
  }

  const user = mockDatabase.users.find(
    (candidate) => candidate.email.toLowerCase() === email.toLowerCase(),
  )
  if (!user || user.password !== password) {
    return errorResponse(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.')
  }

  const response: LoginResponse = { token: createToken(user.id), user: toPublicUser(user) }
  return jsonResponse(200, response)
}

// GET /api/me
export function getCurrentUser(request: MockRequest): Response {
  const user = authenticate(request)
  if (user instanceof Response) return user
  return jsonResponse(200, toPublicUser(user))
}
