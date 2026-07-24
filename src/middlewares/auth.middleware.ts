import type { FastifyReply, FastifyRequest } from 'fastify'
import { authService } from '../services/auth.service.js'
import { UnauthorizedError } from '../utils/errors/http-errors.js'
import { handleError } from '../utils/errors/handle-error.js'

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
  try {
    const authorization = req.headers.authorization

    if (!authorization) {
      throw new UnauthorizedError('Token não informado')
    }

    const [scheme, token] = authorization.split(' ')

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedError('Token inválido')
    }

    const session = await authService.validateToken(token)

    if (session) {
      req.user = {
        id: session.userId,
        token,
      }
    }
  } catch (error) {
    handleError(reply, error)
  }
}
