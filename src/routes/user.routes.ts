import type { FastifyInstance } from 'fastify'
import { swaggerTags } from '../utils/swagger.tags.js'
import { createdUserResponseSchema, createUserSchema } from '../schemas/user.schema.js'
import { userController } from '../controller/user.controller.js'
import { errorResponseSchema } from '../schemas/error.schema.js'

export default async function userRoutes(app: FastifyInstance) {
  app.post('/', {
    schema: {
      tags: [swaggerTags.user.name],

      summary: 'Cria um novo usuário',

      description: 'Cria um novo usuário com os dados fornecidos',

      body: createUserSchema,

      response: {
        201: createdUserResponseSchema,
        400: errorResponseSchema('Dados inválidos'),
        409: errorResponseSchema('Usuário já cadastrado'),
        500: errorResponseSchema('Erro interno do servidor'),
      },
    },
    attachValidation: true,
    handler: userController.createUser.bind(userController),
  })
}
