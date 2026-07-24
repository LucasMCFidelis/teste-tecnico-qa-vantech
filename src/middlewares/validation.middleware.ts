import type { FastifyReply, FastifyRequest } from 'fastify'
import { handleError } from '../utils/errors/handle-error.js'

export async function validationMiddleware(req: FastifyRequest, reply: FastifyReply) {
  if (req.validationError) {
    return handleError(reply, req.validationError)
  }
}
