import type { Session } from '../../../generated/prisma/client.js'

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
