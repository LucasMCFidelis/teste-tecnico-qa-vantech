import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { z } from 'zod'

import { authService } from '../../../services/auth.service.js'
import { prisma } from '../../../lib/prisma.js'
import { sessionInputSchema } from '../../../schemas/auth.schema.js'
import { InternalServerError } from '../../../utils/errors/httpErrors.js'
import { makePrismaSession } from './auth.fixtures.js'
import { hashToken } from '../../../utils/security/token.js'

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}))

const mockedCreate = prisma.session.create as jest.MockedFunction<typeof prisma.session.create>

const mockedFindUnique = prisma.session.findUnique as jest.MockedFunction<
  typeof prisma.session.findUnique
>

describe('AuthService.createSession', () => {
  let parseSpy: ReturnType<typeof jest.spyOn>

  beforeEach(() => {
    parseSpy = jest.spyOn(sessionInputSchema, 'parse')

    jest.spyOn(console, 'error').mockImplementation(() => undefined)

    mockedCreate.mockReset()
    mockedFindUnique.mockReset()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Validação do schema', () => {
    it('deve validar os dados da sessão exatamente uma vez', async () => {
      mockedCreate.mockResolvedValueOnce(makePrismaSession())

      await authService.createSession(1, 'token-test')

      expect(parseSpy).toHaveBeenCalledTimes(1)

      expect(parseSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          token: 'token-test',
          expiresAt: expect.any(Date),
        }),
      )
    })

    it('não deve chamar o Prisma quando a validação falhar', async () => {
      const invalidUserId = 'invalid-id' as unknown as number

      await expect(authService.createSession(invalidUserId, 'token-test')).rejects.toBeInstanceOf(
        z.ZodError,
      )

      expect(mockedCreate).not.toHaveBeenCalled()
    })
  })

  describe('Erro interno do banco', () => {
    it('deve registrar o erro no console e lançar InternalServerError', async () => {
      const dbError = new Error('Falha no banco')

      mockedCreate.mockRejectedValueOnce(dbError)

      const consoleSpy = jest.spyOn(console, 'error')

      await expect(authService.createSession(1, 'token-test')).rejects.toBeInstanceOf(
        InternalServerError,
      )

      expect(consoleSpy).toHaveBeenCalledTimes(1)

      expect(consoleSpy).toHaveBeenCalledWith('Error to create session:', dbError)
    })

    it('deve lançar InternalServerError com mensagem correta', async () => {
      mockedCreate.mockRejectedValueOnce(new Error('Erro inesperado'))

      await expect(authService.createSession(1, 'token-test')).rejects.toThrow(
        'Erro interno ao criar sessão no banco de dados',
      )
    })
  })

  describe('Caminho feliz', () => {
    it('deve criar uma sessão e retornar os dados formatados', async () => {
      const session = makePrismaSession({
        id: 1,
        userId: 10,
        token: 'token-hash',
      })

      mockedCreate.mockResolvedValueOnce(session)

      const result = await authService.createSession(10, 'token-hash')

      expect(result).toEqual({
        id: session.id,
        userId: session.userId,
        token: session.token,
        createdAt: session.createdAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
      })

      expect(mockedCreate).toHaveBeenCalledTimes(1)

      expect(mockedCreate).toHaveBeenCalledWith({
        data: {
          userId: 10,
          token: hashToken(session.token),
          expiresAt: expect.any(Date),
        },
      })
    })
  })
})
