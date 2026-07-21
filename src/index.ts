import fastify from 'fastify'
import 'dotenv/config'
import cors from '@fastify/cors'
import swaggerPlugin from './plugins/swagger'
import healthRoutes from './routes/health'

const server = fastify({ logger: true })

server.register(cors, {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
})

server.register(swaggerPlugin)
server.get('/', (_, reply) => reply.redirect('/api/v1/docs'))
server.register(
  async (api) => {
    api.register(healthRoutes, { prefix: '/health' })
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
