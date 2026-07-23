import type { FastifyReply } from 'fastify'
import { sendError } from '../../routes/helpers.js'
import { HttpError } from './httpErrors.js'
import { ZodError } from 'zod'

export function handleError(reply: FastifyReply, err: unknown) {
  if (err instanceof ZodError) {
    return sendError(reply, err.issues[0]?.message ?? 'Erro de validação.', 400)
  }

  if (err instanceof HttpError) {
    return sendError(reply, err.message, err.statusCode)
  }

  console.error(err)

  return sendError(reply, 'Erro interno do servidor.', 500)
}
