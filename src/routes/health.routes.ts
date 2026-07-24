import type { FastifyInstance } from 'fastify'
import { swaggerTags } from '../utils/swagger.tags.js'
import { healthResponseSchema, degradedHealthResponseSchema } from '../schemas/health.schema.js'
import { healthController } from '../controller/health.controller.js'

export default async function healthRoutes(app: FastifyInstance) {
  app.get('/', {
    schema: {
      tags: [swaggerTags.health.name],

      summary: 'Verifica o status da API',

      description: 'Retorna o status da API e a conectividade com o banco de dados',

      response: {
        200: healthResponseSchema,
        503: degradedHealthResponseSchema,
      },
    },

    handler: healthController.check.bind(healthController),
  })
}
