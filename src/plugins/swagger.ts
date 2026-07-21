import fp from 'fastify-plugin'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import type { FastifyInstance } from 'fastify'
import { swaggerTags } from '../utils/swagger.tags'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'

async function swaggerPlugin(app: FastifyInstance) {
  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'VANTECH QA Fidelis API',
        description:
          'Documentação da API para o projeto desenvolvido como teste técnico para a vaga de Analista de teste na Vantech. Autoria: Lucas Fidelis',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3333',
          description: 'Servidor local',
        },
      ],
      tags: Object.values(swaggerTags),
    },
    transform: jsonSchemaTransform,
  })

  await app.register(fastifySwaggerUi, {
    routePrefix: '/api/v1/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  })
}

export default fp(swaggerPlugin, { name: 'swagger' })
