import type { FastifyReply } from 'fastify'
import { BadRequestError, ConflictError, NotFoundError } from './httpErrors'
import { sendError } from '../../routes/helpers'

export function handleError(reply: FastifyReply, err: unknown) {
  if (err instanceof BadRequestError) {
    return sendError(reply, err.message, 400)
  }

  if (err instanceof NotFoundError) {
    return sendError(reply, err.message, 404)
  }

  if (err instanceof ConflictError) {
    return sendError(reply, err.message, 409)
  }

  return sendError(reply, 'Erro interno do servidor.', 500)
}
