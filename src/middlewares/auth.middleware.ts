import type { FastifyReply, FastifyRequest } from 'fastify'
import { authService } from '../services/auth.service.js'
import { UnauthorizedError } from '../utils/errors/httpErrors.js'
import { handleError } from '../utils/errors/handleError.js'

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
      }
    }
  } catch (error) {
    handleError(reply, error)
  }
}
