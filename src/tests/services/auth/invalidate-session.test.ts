import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'

import { authService } from '../../../services/auth.service.js'
import { prisma } from '../../../lib/prisma.js'
import { InternalServerError } from '../../../utils/errors/http-errors.js'
import { makePrismaSession } from './auth.fixtures.js'

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    session: {
      update: jest.fn(),
    },
  },
}))

const mockedUpdate = prisma.session.update as jest.MockedFunction<typeof prisma.session.update>

describe('AuthService.invalidateSession', () => {
  const id = 1

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)

    mockedUpdate.mockReset()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Erro interno do banco', () => {
    it('deve registrar o erro no console e lançar InternalServerError', async () => {
      const dbError = new Error('Falha no banco')

      mockedUpdate.mockRejectedValueOnce(dbError)

      const consoleSpy = jest.spyOn(console, 'error')

      await expect(authService.invalidateSession(id)).rejects.toBeInstanceOf(InternalServerError)

      expect(consoleSpy).toHaveBeenCalledTimes(1)

      expect(consoleSpy).toHaveBeenCalledWith('Error to invalidate session:', dbError)
    })

    it('deve lançar InternalServerError com mensagem correta', async () => {
      mockedUpdate.mockRejectedValueOnce(new Error('Erro inesperado'))

      await expect(authService.invalidateSession(id)).rejects.toThrow(
        'Erro interno ao invalidar sessão no banco de dados',
      )
    })
  })

  describe('Caminho feliz', () => {
    it('deve invalidar a sessão', async () => {
      const session = makePrismaSession({
        id: 1,
      })

      mockedUpdate.mockResolvedValueOnce(session)

      await authService.invalidateSession(session.id)

      expect(mockedUpdate).toHaveBeenCalledTimes(1)

      expect(mockedUpdate).toHaveBeenCalledWith({
        where: {
          id: session.id,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      })
    })
  })
})
