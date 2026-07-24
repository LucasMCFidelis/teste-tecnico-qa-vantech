import type { FastifyReply, FastifyRequest } from 'fastify'
import { ForbiddenError } from '../utils/errors/http-errors.js'
import { handleError } from '../utils/errors/handle-error.js'

export async function ownerAuthorizationMiddleware(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = Number((req.params as { id: string }).id)

    if (req.user.id !== userId) {
      throw new ForbiddenError('A autorização não permite acessar dados de outro usuário')
    }
  } catch (error) {
    handleError(reply, error)
  }
}
