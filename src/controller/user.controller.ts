import type { FastifyReply, FastifyRequest } from 'fastify'
import { handleError } from '../utils/errors/handleError'
import type { CreateUserInput } from '../schemas/user.schema'
import { userService } from '../services/user.service'

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
