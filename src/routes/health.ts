import type { FastifyInstance } from 'fastify'
import { swaggerTags } from '../utils/swagger.tags'
import { healthSchema } from '../schemas/health.schema'

export default async function healthRoutes(app: FastifyInstance) {
  app.get('/', {
    schema: {
      tags: [swaggerTags.health.name],
      summary: 'Verifica o status da API',
      description: 'Retorna o status da API e a conectividade com o banco de dados',
      response: {
        200: healthSchema,
      },
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
