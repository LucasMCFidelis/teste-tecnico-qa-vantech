import type { FastifyReply, FastifyRequest } from 'fastify'
import { handleError } from '../utils/errors/handle-error.js'
import type { LoginUserInput } from '../schemas/auth.schema.js'
import { authService } from '../services/auth.service.js'

class AuthController {
  async loginUser(
    req: FastifyRequest<{ Body: LoginUserInput }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const userCredentials = req.body
      const token = await authService.login(userCredentials)
      return reply.status(201).send(token)
    } catch (error) {
      handleError(reply, error)
    }
  }

  async logoutUser(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const token = req.user.token
      await authService.logout(token)
      return reply.status(200).send({ success: true })
    } catch (error) {
      handleError(reply, error)
    }
  }
}

export const authController = new AuthController()
