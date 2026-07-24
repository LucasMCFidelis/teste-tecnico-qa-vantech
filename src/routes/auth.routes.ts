import type { FastifyInstance } from 'fastify'
import { swaggerTags } from '../utils/swagger.tags.js'
import { errorResponseSchema } from '../schemas/error.schema.js'
import type { LoginUserInput } from '../schemas/auth.schema.js'
import { loggedUserResponseSchema, loginUserSchema } from '../schemas/auth.schema.js'
import { authController } from '../controller/auth.controller.js'
import { validationMiddleware } from '../middlewares/validation.middleware.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

export default async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: LoginUserInput }>('/login', {
    schema: {
      tags: [swaggerTags.auth.name],

      summary: 'Realiza processo de login para o usuário',

      description: 'Processa o login do usuário, salva a sessão e retorna o token de acesso',

      body: loginUserSchema,

      response: {
        201: loggedUserResponseSchema,
        400: errorResponseSchema('Dados de entrada inválidos'),
        401: errorResponseSchema('Credenciais inválidas'),
        404: errorResponseSchema('Usuário não encontrado'),
        500: errorResponseSchema('Erro interno do servidor'),
      },
    },
    attachValidation: true,
    preHandler: validationMiddleware,
    handler: authController.loginUser.bind(authController),
  })
  app.post('/logout', {
    schema: {
      tags: [swaggerTags.auth.name],

      summary: 'Realiza processo de logout para o usuário',

      description:
        'Processa o logout do usuário, inválida a sessão e retorna boolean como status da operação',
    },
    attachValidation: true,
    preHandler: authMiddleware,
    handler: authController.logoutUser.bind(authController),
  })
}
