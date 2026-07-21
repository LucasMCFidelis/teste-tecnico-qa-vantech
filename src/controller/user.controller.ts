import type { FastifyReply, FastifyRequest } from 'fastify'
import { handleError } from '../utils/errors/handleError.js'
import type { CreateUserInput } from '../schemas/user.schema.js'
import { userService } from '../services/user.service.js'

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
}

export const userController = new UserController()
