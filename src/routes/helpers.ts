import type { FastifyReply } from 'fastify'

export function sendError(reply: FastifyReply, message: string, status = 400): void {
  reply.status(status).send({ error: message })
}
