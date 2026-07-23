import type { FastifyInstance } from 'fastify'
import { swaggerTags } from '../utils/swagger.tags.js'
import type { GetUserParams } from '../schemas/user.schema.js'
import {
  createdUserResponseSchema,
  createUserSchema,
  getUserSchema,
} from '../schemas/user.schema.js'
import { userController } from '../controller/user.controller.js'
import { errorResponseSchema } from '../schemas/error.schema.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { ownerAuthorizationMiddleware } from '../middlewares/authorize-user.middleware.js'
import { validationMiddleware } from '../middlewares/validation.middleware.js'

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
  app.get<{ Params: GetUserParams }>('/:id', {
    schema: {
      tags: [swaggerTags.user.name],

      summary: 'Busca usuário por id',

      description: 'Retorna usuário de acordo com o id',

      params: getUserSchema,

      response: {
        200: createdUserResponseSchema,
        400: errorResponseSchema('Parâmetro "id" inválido'),
        401: errorResponseSchema('Token inválido ou não informado'),
        403: errorResponseSchema('A autorização não permite acessar dados de outro usuário'),
        404: errorResponseSchema('Usuário não encontrado'),
        500: errorResponseSchema('Erro interno do servidor'),
      },
    },
    attachValidation: true,
    preHandler: [validationMiddleware, authMiddleware, ownerAuthorizationMiddleware],
    handler: userController.getUser.bind(userController),
  })
}
