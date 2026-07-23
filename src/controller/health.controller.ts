import type { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../lib/prisma.js'

class HealthController {
  async check(_: FastifyRequest, reply: FastifyReply) {
    const dbOk = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false)

    return reply.status(dbOk ? 200 : 503).send({
      status: dbOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbOk ? 'ok' : 'unreachable',
      },
    })
  }
}

export const healthController = new HealthController()
