import type { FastifyReply, FastifyRequest } from 'fastify'
import { handleError } from '../utils/errors/handleError.js'
import { getUserSchema, type CreateUserInput, type GetUserParams } from '../schemas/user.schema.js'
import { userService } from '../services/user.service.js'
import { toUserResponse } from '../tests/utils/to-user-response.js'

class UserController {
  async createUser(
    req: FastifyRequest<{ Body: CreateUserInput }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const userData = req.body
      const createdUser = await userService.createUser(userData)
      return reply.status(201).send(createdUser)
    } catch (error) {
      handleError(reply, error)
    }
  }

  async getUser(
    req: FastifyRequest<{ Params: GetUserParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { id: userId } = getUserSchema.parse(req.params)
      const userData = await userService.getUserById(userId)

      return reply.status(200).send(toUserResponse(userData!))
    } catch (error) {
      handleError(reply, error)
    }
  }
}

export const userController = new UserController()
