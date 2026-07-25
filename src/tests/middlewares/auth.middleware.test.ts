import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { authService } from '../../services/auth.service.js'
import { handleError } from '../../utils/errors/handle-error.js'
import { UnauthorizedError } from '../../utils/errors/http-errors.js'
import { makeSessionResponse } from '../services/auth/auth.fixtures.js'

jest.mock('../../services/auth.service.js', () => ({
  authService: {
    validateToken: jest.fn(),
  },
}))

jest.mock('../../utils/errors/handle-error.js', () => ({
  handleError: jest.fn(),
}))

const mockedValidateToken = authService.validateToken as jest.MockedFunction<
  typeof authService.validateToken
>

const mockedHandleError = handleError as jest.MockedFunction<typeof handleError>

describe('authMiddleware', () => {
  let request: FastifyRequest
  let reply: FastifyReply

  beforeEach(() => {
    request = {
      headers: {},
    } as FastifyRequest

    reply = {} as FastifyReply

    mockedValidateToken.mockReset()
    mockedHandleError.mockReset()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Validação do Authorization Header', () => {
    it('deve retornar erro quando o header Authorization não for informado', async () => {
      await authMiddleware(request, reply)

      expect(mockedValidateToken).not.toHaveBeenCalled()

      expect(mockedHandleError).toHaveBeenCalledWith(reply, expect.any(UnauthorizedError))
    })

    it('deve retornar erro quando o esquema não for Bearer', async () => {
      request.headers.authorization = 'Basic token'

      await authMiddleware(request, reply)

      expect(mockedValidateToken).not.toHaveBeenCalled()

      expect(mockedHandleError).toHaveBeenCalledWith(reply, expect.any(UnauthorizedError))
    })

    it('deve retornar erro quando o token não for informado', async () => {
      request.headers.authorization = 'Bearer'

      await authMiddleware(request, reply)

      expect(mockedValidateToken).not.toHaveBeenCalled()

      expect(mockedHandleError).toHaveBeenCalledWith(reply, expect.any(UnauthorizedError))
    })
  })

  describe('Validação da sessão', () => {
    it('deve chamar validateToken com o token recebido', async () => {
      mockedValidateToken.mockResolvedValue(makeSessionResponse())

      request.headers.authorization = 'Bearer token-test'

      await authMiddleware(request, reply)

      expect(mockedValidateToken).toHaveBeenCalledTimes(1)

      expect(mockedValidateToken).toHaveBeenCalledWith('token-test')
    })

    it('deve adicionar o usuário autenticado na requisição', async () => {
      mockedValidateToken.mockResolvedValue(
        makeSessionResponse({
          userId: 99,
        }),
      )

      request.headers.authorization = 'Bearer token-test'

      await authMiddleware(request, reply)

      expect(request.user).toEqual({
        id: 99,
        token: 'token-test',
      })
    })

    it('deve encaminhar erro do AuthService para o handleError', async () => {
      const error = new UnauthorizedError('Token inválido')

      mockedValidateToken.mockRejectedValue(error)

      request.headers.authorization = 'Bearer token-test'

      await authMiddleware(request, reply)

      expect(mockedHandleError).toHaveBeenCalledTimes(1)

      expect(mockedHandleError).toHaveBeenCalledWith(reply, error)
    })
  })
})
