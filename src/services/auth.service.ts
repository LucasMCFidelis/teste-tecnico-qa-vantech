import { prisma } from '../lib/prisma.js'
import type { SessionResponse } from '../schemas/auth.schema.js'
import {
  loginUserSchema,
  sessionInputSchema,
  type LoggedUserResponse,
  type LoginUserInput,
} from '../schemas/auth.schema.js'
import {
  GoneError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors/httpErrors.js'
import { userService } from './user.service.js'
import { generateToken, hashToken } from '../utils/security/token.js'
import { comparePasswords } from '../utils/security/password.js'

class AuthService {
  private getNewExpiresAtDate(): Date {
    const DEFAULT_SESSION_TIME_MILLISECONDS = 3600000 // 60 minutos
    return new Date(Date.now() + DEFAULT_SESSION_TIME_MILLISECONDS)
  }

  private checkSessionIsValide(expiresAt: Date): void {
    if (!expiresAt) return
    if (new Date() > expiresAt) {
      throw new GoneError('Essa sessão não está mais disponível. Realize login novamente')
    }
  }

  async createSession(userId: number, token: string): Promise<SessionResponse> {
    const expiresAt = this.getNewExpiresAtDate()

    sessionInputSchema.parse({ userId, token, expiresAt })

    try {
      const session = await prisma.session.create({
        data: {
          token,
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
    const hashedToken = hashToken(token)

    const session = await prisma.session.findUnique({
      where: {
        token: hashedToken,
      },
    })

    if (!session) {
      throw new UnauthorizedError('Token inválido')
    }

    this.checkSessionIsValide(session.expiresAt)

    return {
      id: session.id,
      userId: session.userId,
      token: session.token,
      createdAt: session.createdAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
    }
  }
}

export const authService = new AuthService()
