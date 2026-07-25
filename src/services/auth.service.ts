import { prisma } from '../lib/prisma.js'
import type { SessionResponse } from '../schemas/auth.schema.js'
import {
  loginUserSchema,
  sessionInputSchema,
  type LoggedUserResponse,
  type LoginUserInput,
} from '../schemas/auth.schema.js'
import {
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors/http-errors.js'
import { userService } from './user.service.js'
import { generateToken, hashToken } from '../utils/security/token.js'
import { comparePasswords } from '../utils/security/password.js'
import type { Session } from '../generated/prisma/client.js'

class AuthService {
  private getNewExpiresAtDate(): Date {
    const DEFAULT_SESSION_TIME_MILLISECONDS = 3600000 // 60 minutos
    return new Date(Date.now() + DEFAULT_SESSION_TIME_MILLISECONDS)
  }

  private checkSessionIsValid({
    expiresAt,
    revokedAt,
  }: {
    expiresAt: Date
    revokedAt?: Date | null
  }): void {
    if (revokedAt) {
      throw new UnauthorizedError('Essa sessão foi revogada')
    }

    if (new Date() > expiresAt) {
      throw new UnauthorizedError('Essa sessão expirou. Realize login novamente')
    }
  }

  async getSessionByToken(token: string): Promise<Session> {
    const hashedToken = hashToken(token)

    let session
    try {
      session = await prisma.session.findUnique({
        where: {
          token: hashedToken,
        },
      })
    } catch (error) {
      console.error('Error to get session:', error)
      throw new InternalServerError('Erro interno ao buscar sessão no banco de dados')
    }

    if (!session) {
      throw new UnauthorizedError('Token inválido')
    }

    return session
  }

  async invalidateSession(sessionId: number): Promise<void> {
    try {
      await prisma.session.update({
        where: { id: sessionId },
        data: { revokedAt: new Date() },
      })
    } catch (error) {
      console.error('Error to invalidate session:', error)
      throw new InternalServerError('Erro interno ao invalidar sessão no banco de dados')
    }
  }

  async createSession(userId: number, token: string): Promise<SessionResponse> {
    const expiresAt = this.getNewExpiresAtDate()

    sessionInputSchema.parse({ userId, token, expiresAt })

    const hashedToken = hashToken(token)

    try {
      const session = await prisma.session.create({
        data: {
          token: hashedToken,
          userId,
          expiresAt,
        },
      })
      return {
        id: session.id,
        userId: session.userId,
        token: session.token,
        createdAt: session.createdAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
      }
    } catch (error) {
      console.error('Error to create session:', error)
      throw new InternalServerError('Erro interno ao criar sessão no banco de dados')
    }
  }

  async login(userCredentials: LoginUserInput): Promise<LoggedUserResponse | void> {
    loginUserSchema.parse(userCredentials)

    const user = await userService.getUserByEmail(userCredentials.email)
    if (!user) {
      throw new NotFoundError('Usuário não encontrado')
    }

    const isPasswordValid = await comparePasswords(userCredentials.password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciais inválidas')
    }

    const token = generateToken()

    await this.createSession(user.id, token)

    return { token }
  }

  async validateToken(token: string): Promise<SessionResponse | null> {
    const session = await this.getSessionByToken(token)
    this.checkSessionIsValid({ expiresAt: session.expiresAt, revokedAt: session.revokedAt })

    return {
      id: session.id,
      userId: session.userId,
      token: session.token,
      createdAt: session.createdAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
    }
  }

  async logout(token: string): Promise<void> {
    const session = await this.getSessionByToken(token)

    await this.invalidateSession(session.id)
  }
}

export const authService = new AuthService()
