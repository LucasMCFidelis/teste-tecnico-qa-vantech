import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: number
      token: string
    }
  }
}
