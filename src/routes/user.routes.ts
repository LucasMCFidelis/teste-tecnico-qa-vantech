import type { FastifyInstance } from 'fastify'
import { swaggerTags } from '../utils/swagger.tags'
import { createdUserResponseSchema, createUserSchema } from '../schemas/user.schema'
import { userController } from '../controller/user.controller'
import { errorResponseSchema } from '../schemas/error.schema'

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
