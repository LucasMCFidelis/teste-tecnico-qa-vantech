import type { FastifyReply, FastifyRequest } from 'fastify'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ownerAuthorizationMiddleware } from '../../middlewares/authorize-user.middleware.js'
import { handleError } from '../../utils/errors/handle-error.js'
import { ForbiddenError } from '../../utils/errors/http-errors.js'

jest.mock('../../utils/errors/handle-error.js', () => ({
  handleError: jest.fn(),
}))

const mockedHandleError = handleError as jest.MockedFunction<typeof handleError>

describe('ownerAuthorizationMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve permitir quando o usuário autenticado for o proprietário do recurso', async () => {
    const req = {
      params: {
        id: '1',
      },
      user: {
        id: 1,
      },
    } as FastifyRequest

    const reply = {} as FastifyReply

    await ownerAuthorizationMiddleware(req, reply)

    expect(mockedHandleError).not.toHaveBeenCalled()
  })

  it('deve retornar erro quando o usuário tentar acessar recurso de outro usuário', async () => {
    const req = {
      params: {
        id: '2',
      },
      user: {
        id: 1,
      },
    } as FastifyRequest

    const reply = {} as FastifyReply

    await ownerAuthorizationMiddleware(req, reply)

    expect(mockedHandleError).toHaveBeenCalledTimes(1)

    const [, error] = mockedHandleError.mock.calls[0]

    expect(error).toBeInstanceOf(ForbiddenError)
    expect((error as ForbiddenError).message).toBe(
      'A autorização não permite acessar dados de outro usuário',
    )
  })
})
