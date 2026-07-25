import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals'
import type { FastifyReply, FastifyRequest } from 'fastify'

import { authController } from '../../controller/auth.controller.js'
import { authService } from '../../services/auth.service.js'
import { UnauthorizedError } from '../../utils/errors/http-errors.js'
import type { LoginUserInput } from '../../schemas/auth.schema.js'
import { makeLogin } from '../services/auth/auth.fixtures.js'

jest.mock('../../services/auth.service.js', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
  },
}))

const mockedLogin = authService.login as jest.MockedFunction<typeof authService.login>
const mockedLogout = authService.logout as jest.MockedFunction<typeof authService.logout>

function makeMockReply(): FastifyReply {
  return {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as FastifyReply
}

describe('AuthController', () => {
  let reply: FastifyReply

  beforeEach(() => {
    reply = makeMockReply()
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    mockedLogin.mockReset()
    mockedLogout.mockReset()
  })

  describe('loginUser', () => {
    it('deve retornar 201 com o token quando as credenciais são válidas', async () => {
      mockedLogin.mockResolvedValueOnce({ token: 'generated-token' })

      const req = {
        body: makeLogin(),
      } as FastifyRequest<{ Body: LoginUserInput }>

      await authController.loginUser(req, reply)

      expect(mockedLogin).toHaveBeenCalledWith(req.body)
      expect(reply.status).toHaveBeenCalledWith(201)
      expect(reply.send).toHaveBeenCalledWith({ token: 'generated-token' })
    })

    it('deve delegar o erro para handleError quando as credenciais são inválidas', async () => {
      mockedLogin.mockRejectedValueOnce(new UnauthorizedError('Credenciais inválidas'))

      const req = {
        body: makeLogin(),
      } as FastifyRequest<{ Body: LoginUserInput }>

      await authController.loginUser(req, reply)

      expect(reply.status).toHaveBeenCalledWith(401)
      expect(reply.send).toHaveBeenCalledWith({ error: 'Credenciais inválidas' })
    })
  })

  describe('logoutUser', () => {
    it('deve retornar 200 com sucesso quando o logout é realizado', async () => {
      mockedLogout.mockResolvedValueOnce(undefined)

      const req = { user: { id: 1, token: 'valid-token' } } as FastifyRequest

      await authController.logoutUser(req, reply)

      expect(mockedLogout).toHaveBeenCalledWith('valid-token')
      expect(reply.status).toHaveBeenCalledWith(200)
      expect(reply.send).toHaveBeenCalledWith({ success: true })
    })

    it('deve delegar o erro para handleError quando o token é inválido', async () => {
      mockedLogout.mockRejectedValueOnce(new UnauthorizedError('Token inválido'))

      const req = { user: { id: 1, token: 'invalid-token' } } as FastifyRequest

      await authController.logoutUser(req, reply)

      expect(reply.status).toHaveBeenCalledWith(401)
      expect(reply.send).toHaveBeenCalledWith({ error: 'Token inválido' })
    })
  })
})
