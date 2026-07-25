import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals'
import { ZodError, z } from 'zod'
import type { FastifyReply } from 'fastify'

import { handleError } from '../../../utils/errors/handle-error.js'
import { BadRequestError, ForbiddenError } from '../../../utils/errors/http-errors.js'

function makeMockReply(): FastifyReply {
  const reply = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as FastifyReply
  return reply
}

describe('handleError', () => {
  let reply: FastifyReply
  let consoleErrorSpy: ReturnType<typeof jest.spyOn>

  beforeEach(() => {
    reply = makeMockReply()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('deve tratar instâncias de ZodError', () => {
    const schema = z.object({ email: z.email('E-mail inválido') })
    const result = schema.safeParse({ email: 'not-an-email' })
    const zodError = result.error as ZodError

    handleError(reply, zodError)

    expect(reply.status).toHaveBeenCalledWith(400)
    expect(reply.send).toHaveBeenCalledWith({ error: 'E-mail inválido' })
  })

  it('deve usar mensagem padrão quando ZodError não possui issues', () => {
    const emptyZodError = new ZodError([])

    handleError(reply, emptyZodError)

    expect(reply.status).toHaveBeenCalledWith(400)
    expect(reply.send).toHaveBeenCalledWith({ error: 'Erro de validação.' })
  })

  it('deve tratar instâncias de Error com validation (erro nativo do Fastify)', () => {
    const fastifyValidationError = Object.assign(new Error('Erro de schema'), {
      validation: [{ message: 'campo "name" é obrigatório' }],
    })

    handleError(reply, fastifyValidationError)

    expect(reply.status).toHaveBeenCalledWith(400)
    expect(reply.send).toHaveBeenCalledWith({ error: 'campo "name" é obrigatório' })
  })

  it('deve usar mensagem padrão quando validation não possui mensagem', () => {
    const fastifyValidationError = Object.assign(new Error('Erro de schema'), {
      validation: [],
    })

    handleError(reply, fastifyValidationError)

    expect(reply.status).toHaveBeenCalledWith(400)
    expect(reply.send).toHaveBeenCalledWith({ error: 'Erro de validação.' })
  })

  it('deve tratar instâncias de HttpError com o status code correspondente', () => {
    const forbiddenError = new ForbiddenError('Acesso negado')

    handleError(reply, forbiddenError)

    expect(reply.status).toHaveBeenCalledWith(403)
    expect(reply.send).toHaveBeenCalledWith({ error: 'Acesso negado' })
  })

  it('deve tratar diferentes subclasses de HttpError com seus respectivos status codes', () => {
    const badRequestError = new BadRequestError('Dados inválidos')

    handleError(reply, badRequestError)

    expect(reply.status).toHaveBeenCalledWith(400)
    expect(reply.send).toHaveBeenCalledWith({ error: 'Dados inválidos' })
  })

  it('deve tratar erros desconhecidos como erro interno (500) e logar no console', () => {
    const unknownError = new Error('Falha inesperada de rede')

    handleError(reply, unknownError)

    expect(consoleErrorSpy).toHaveBeenCalledWith(unknownError)
    expect(reply.status).toHaveBeenCalledWith(500)
    expect(reply.send).toHaveBeenCalledWith({ error: 'Erro interno do servidor.' })
  })

  it('deve tratar valores que não são instâncias de Error como erro interno (500)', () => {
    const nonErrorValue = 'algo deu errado'

    handleError(reply, nonErrorValue)

    expect(reply.status).toHaveBeenCalledWith(500)
    expect(reply.send).toHaveBeenCalledWith({ error: 'Erro interno do servidor.' })
  })
})
