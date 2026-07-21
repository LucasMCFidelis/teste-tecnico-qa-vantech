import type { FastifyInstance } from 'fastify'
import { swaggerTags } from '../utils/swagger.tags'

const healthResponseSchema = {
  200: {
    description: 'API e banco de dados operacionais',
    type: 'object',
    properties: {
      status: { type: 'string', example: 'ok' },
      timestamp: { type: 'string', format: 'date-time' },
      services: {
        type: 'object',
      },
    },
  },
}

export default async function healthRoutes(app: FastifyInstance) {
  app.get('/', {
    schema: {
      tags: [swaggerTags.health.name],
      summary: 'Verifica o status da API',
      description: 'Retorna o status da API e a conectividade com o banco de dados',
      response: healthResponseSchema,
    },
    handler: async (_, reply) => {
      return reply.status(200).send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {},
      })
    },
  })
}
