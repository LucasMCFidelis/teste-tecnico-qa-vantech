import fastify from 'fastify'
import 'dotenv/config'
import cors from '@fastify/cors'
import swaggerPlugin from './plugins/swagger.js'
import healthRoutes from './routes/health.routes.js'
import userRoutes from './routes/user.routes.js'
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod'
import authRoutes from './routes/auth.routes.js'

const server = fastify({ logger: true })

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.register(cors, {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
})

server.register(swaggerPlugin)
server.get('/', (_, reply) => reply.redirect('/api/v1/docs'))
server.register(
  async (api) => {
    api.register(healthRoutes, { prefix: '/health' })
    api.register(userRoutes, { prefix: '/users' })
    api.register(authRoutes, { prefix: '/auth' })
  },
  { prefix: '/api/v1' },
)

const PORT = Number(process.env.PORT) || 3333
const HOST = process.env.HOST || 'localhost'

server
  .listen({ port: PORT, host: HOST })
  .then(() => {
    const baseUrl = `http://${HOST}:${PORT}`
    console.info(`Servidor rodando em ${baseUrl}`)
    console.info(`Documentação Swagger em ${baseUrl}/api/v1/docs`)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
