import { describe, it, expect, jest } from '@jest/globals'
import { authService } from '../../../services/auth.service.js'
import { prisma } from '../../../lib/prisma.js'
import { makePrismaSession } from './auth.fixtures.js'
import { GoneError, UnauthorizedError } from '../../../utils/errors/http-errors.js'

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}))

const mockedFindUnique = prisma.session.findUnique as jest.MockedFunction<
  typeof prisma.session.findUnique
>

describe('AuthService.validateToken', () => {
  it('deve lançar UnauthorizedError quando a sessão não existir', async () => {
    mockedFindUnique.mockResolvedValue(null)

    await expect(authService.validateToken('token')).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('deve retornar a sessão encontrada', async () => {
    const session = makePrismaSession()

    mockedFindUnique.mockResolvedValue(session)

    const result = await authService.validateToken('token')

    expect(result).toEqual({
      id: session.id,
      userId: session.userId,
      token: session.token,
      createdAt: session.createdAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
    })
  })

  it('deve buscar utilizando o hash do token', async () => {
    mockedFindUnique.mockResolvedValue(makePrismaSession())

    await authService.validateToken('meu-token')

    expect(mockedFindUnique).toHaveBeenCalledWith({
      where: {
        token: expect.stringMatching(/^[a-f0-9]{64}$/),
      },
    })
  })

  it('deve lançar GoneError quando a sessão estiver expirada', async () => {
    mockedFindUnique.mockResolvedValue(
      makePrismaSession({
        createdAt: new Date(),
        expiresAt: new Date(Date.now() - 60_000),
      }),
    )

    await expect(authService.validateToken('token')).rejects.toThrow(GoneError)
  })

  it('deve lançar UnauthorizedError quando o token tiver sido revogado', async () => {
    mockedFindUnique.mockResolvedValue(
      makePrismaSession({
        revokedAt: new Date(),
      }),
    )

    await expect(authService.validateToken('token')).rejects.toThrow(UnauthorizedError)
  })
})
