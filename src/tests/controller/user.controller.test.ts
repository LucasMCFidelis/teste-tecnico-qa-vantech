import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals'
import type { FastifyReply, FastifyRequest } from 'fastify'

import { userController } from '../../controller/user.controller.js'
import { userService } from '../../services/user.service.js'
import { NotFoundError } from '../../utils/errors/http-errors.js'
import type { CreateUserInput, GetUserParams } from '../../schemas/user.schema.js'
import { makeUser } from '../services/user/user.fixtures.js'

jest.mock('../../services/user.service.js', () => ({
  userService: {
    createUser: jest.fn(),
    getUserById: jest.fn(),
  },
}))

const mockedCreateUser = userService.createUser as jest.MockedFunction<
  typeof userService.createUser
>
const mockedGetUserById = userService.getUserById as jest.MockedFunction<
  typeof userService.getUserById
>

function makeMockReply(): FastifyReply {
  return {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as FastifyReply
}

describe('UserController', () => {
  let reply: FastifyReply

  beforeEach(() => {
    reply = makeMockReply()
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    mockedCreateUser.mockReset()
    mockedGetUserById.mockReset()
  })

  describe('createUser', () => {
    it('deve retornar 201 com o usuário criado quando o service resolve com sucesso', async () => {
      const userData = makeUser()
      const createdUser = {
        id: 1,
        ...userData,
        createdAt: new Date().toISOString(),
      }
      mockedCreateUser.mockResolvedValueOnce(createdUser)

      const req = {
        body: userData,
      } as FastifyRequest<{ Body: CreateUserInput }>

      await userController.createUser(req, reply)

      expect(mockedCreateUser).toHaveBeenCalledWith(req.body)
      expect(reply.status).toHaveBeenCalledWith(201)
      expect(reply.send).toHaveBeenCalledWith(createdUser)
    })

    it('deve delegar o erro para handleError quando o service rejeita', async () => {
      mockedCreateUser.mockRejectedValueOnce(new NotFoundError('Usuário não encontrado'))

      const req = {
        body: makeUser(),
      } as FastifyRequest<{ Body: CreateUserInput }>

      await userController.createUser(req, reply)

      expect(reply.status).toHaveBeenCalledWith(404)
      expect(reply.send).toHaveBeenCalledWith({ error: 'Usuário não encontrado' })
    })
  })

  describe('getUser', () => {
    it('deve retornar 200 com o usuário encontrado', async () => {
      const foundUser = {
        id: 1,
        ...makeUser(),
        createdAt: new Date(),
      }
      mockedGetUserById.mockResolvedValueOnce(foundUser)

      const req = { params: { id: 1 } } as unknown as FastifyRequest<{ Params: GetUserParams }>

      await userController.getUser(req, reply)

      expect(mockedGetUserById).toHaveBeenCalledWith(1)
      expect(reply.status).toHaveBeenCalledWith(200)
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, email: foundUser.email }),
      )
    })

    it('deve delegar o erro para handleError quando o id não passa na validação do schema', async () => {
      const req = { params: { id: 'abc' } } as unknown as FastifyRequest<{ Params: GetUserParams }>

      await userController.getUser(req, reply)

      expect(reply.status).toHaveBeenCalledWith(400)
      expect(mockedGetUserById).not.toHaveBeenCalled()
    })

    it('deve delegar o erro para handleError quando o service rejeita', async () => {
      mockedGetUserById.mockRejectedValueOnce(new NotFoundError('Usuário não encontrado'))

      const req = { params: { id: 1 } } as unknown as FastifyRequest<{ Params: GetUserParams }>

      await userController.getUser(req, reply)

      expect(reply.status).toHaveBeenCalledWith(404)
      expect(reply.send).toHaveBeenCalledWith({ error: 'Usuário não encontrado' })
    })
  })
})
