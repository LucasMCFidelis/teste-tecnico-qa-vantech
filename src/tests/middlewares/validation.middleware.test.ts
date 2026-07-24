import type { FastifyReply, FastifyRequest } from 'fastify'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { validationMiddleware } from '../../middlewares/validation.middleware.js'
import { handleError } from '../../utils/errors/handle-error.js'

jest.mock('../../utils/errors/handle-error.js', () => ({
  handleError: jest.fn(),
}))

const mockedHandleError = handleError as jest.MockedFunction<typeof handleError>

describe('ValidationMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve chamar handleError quando existir validationError', async () => {
    const validationError = {
      validation: [
        {
          message: 'Campo obrigatório',
        },
      ],
    }

    const req = {
      validationError,
    } as FastifyRequest

    const reply = {} as FastifyReply

    await validationMiddleware(req, reply)

    expect(mockedHandleError).toHaveBeenCalledTimes(1)
    expect(mockedHandleError).toHaveBeenCalledWith(reply, validationError)
  })

  it('não deve chamar handleError quando não existir validationError', async () => {
    const req = {} as FastifyRequest

    const reply = {} as FastifyReply

    await validationMiddleware(req, reply)

    expect(mockedHandleError).not.toHaveBeenCalled()
  })
})
