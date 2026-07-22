import type { Session } from '../../../generated/prisma/client.js'
import type {
  LoggedUserResponse,
  LoginUserInput,
  SessionResponse,
} from '../../../schemas/auth.schema.js'

export function makeSessionInput() {
  return {
    userId: 1,
    token: 'token-test',
  }
}

export function makePrismaSession(override: Partial<Session> = {}): Session {
  return {
    id: 1,
    userId: 1,
    token: 'token-hash',
    createdAt: new Date('2026-07-21T10:00:00Z'),
    expiresAt: new Date('2026-07-21T11:00:00Z'),
    ...override,
  }
}

export function makeSessionResponse(override: Partial<SessionResponse> = {}): SessionResponse {
  return {
    id: 1,
    userId: 1,
    token: 'token-test',
    createdAt: new Date('2026-07-22T10:00:00Z').toISOString(),
    expiresAt: new Date('2026-07-22T11:00:00Z').toISOString(),
    ...override,
  }
}

export function makeLogin(override: Partial<LoginUserInput> = {}): LoginUserInput {
  return {
    email: 'john.doe@example.com',
    password: '12345678',
    ...override,
  }
}

export function makeLoggedUserResponse(
  override: Partial<LoggedUserResponse> = {},
): LoggedUserResponse {
  return {
    token: 'token-test',
    ...override,
  }
}
