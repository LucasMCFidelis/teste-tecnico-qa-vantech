import type { FastifyInstance } from 'fastify'
import { swaggerTags } from '../utils/swagger.tags.js'
import { healthSchema } from '../schemas/health.schema.js'
import { prisma } from '../lib/prisma.js'

export default async function healthRoutes(app: FastifyInstance) {
  app.get('/', {
    schema: {
      tags: [swaggerTags.health.name],
      summary: 'Verifica o status da API',
      description: 'Retorna o status da API e a conectividade com o banco de dados',
      response: {
        200: healthSchema.meta({
          example: {
            status: 'ok',
            timestamp: '2026-07-21T12:30:00.000Z',
            services: {
              database: 'ok',
            },
          },
        }),

        503: healthSchema.meta({
          example: {
            status: 'degraded',
            timestamp: '2026-07-21T12:30:00.000Z',
            services: {
              database: 'unreachable',
            },
          },
        }),
      },
    },
    handler: async (_, reply) => {
      const dbOk = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false)

      return reply.status(dbOk ? 200 : 503).send({
        status: dbOk ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        services: { database: dbOk ? 'ok' : 'unreachable' },
      })
    },
  })
}
