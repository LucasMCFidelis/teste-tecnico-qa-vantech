import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'

import { authService } from '../../../services/auth.service.js'
import { prisma } from '../../../lib/prisma.js'
import { InternalServerError, UnauthorizedError } from '../../../utils/errors/http-errors.js'
import { makePrismaSession } from './auth.fixtures.js'

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    session: {
      findUnique: jest.fn(),
    },
  },
}))

const mockedFindUnique = prisma.session.findUnique as jest.MockedFunction<
  typeof prisma.session.findUnique
>

describe('AuthService.getSessionByToken', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)

    mockedFindUnique.mockReset()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Erro interno do banco', () => {
    it('deve registrar o erro no console e lançar InternalServerError', async () => {
      const dbError = new Error('Falha no banco')

      mockedFindUnique.mockRejectedValueOnce(dbError)

      const consoleSpy = jest.spyOn(console, 'error')

      await expect(authService.getSessionByToken('token-test')).rejects.toBeInstanceOf(
        InternalServerError,
      )

      expect(consoleSpy).toHaveBeenCalledTimes(1)

      expect(consoleSpy).toHaveBeenCalledWith('Error to get session:', dbError)
    })

    it('deve lançar InternalServerError com mensagem correta', async () => {
      mockedFindUnique.mockRejectedValueOnce(new Error('Erro inesperado'))

      await expect(authService.getSessionByToken('token-test')).rejects.toThrow(
        'Erro interno ao buscar sessão no banco de dados',
      )
    })
  })

  it('deve lançar UnauthorizedError quando o token não existir', async () => {
    mockedFindUnique.mockResolvedValueOnce(null)

    await expect(authService.getSessionByToken('token-inexistente-test')).rejects.toBeInstanceOf(
      UnauthorizedError,
    )
  })

  describe('Caminho feliz', () => {
    it('deve buscar a sessão e retornar os dados formatados', async () => {
      const session = makePrismaSession({
        id: 1,
        userId: 10,
        token: 'token-hash',
      })

      mockedFindUnique.mockResolvedValueOnce(session)

      const result = await authService.getSessionByToken('token-hash')

      expect(result).toEqual({
        id: session.id,
        userId: session.userId,
        token: session.token,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        revokedAt: null,
      })

      expect(mockedFindUnique).toHaveBeenCalledTimes(1)
    })
  })
})
