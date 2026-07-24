import { describe, it, expect, jest, beforeEach } from '@jest/globals'

import { userService } from '../../../services/user.service.js'
import type { User } from '../../../generated/prisma/client.js'
import { InternalServerError, NotFoundError } from '../../../utils/errors/http-errors.js'
import { makePrismaUser } from './user.fixtures.js'
import { prisma } from '../../../lib/prisma.js'

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

const mockedFindUnique = prisma.user.findUnique as jest.MockedFunction<
  typeof prisma.user.findUnique
>

describe('UserService.getUserById', () => {
  const id = 1

  beforeEach(() => {
    mockedFindUnique.mockReset()
  })

  it('deve buscar o usuário pelo id informado', async () => {
    const user: User = makePrismaUser({ id })

    mockedFindUnique.mockResolvedValueOnce(user)

    const result = await userService.getUserById(id)

    expect(result).toEqual(user)

    expect(mockedFindUnique).toHaveBeenCalledTimes(1)

    expect(mockedFindUnique).toHaveBeenCalledWith({
      where: {
        id,
      },
    })
  })

  it('deve retornar NotFoundError quando o usuário não existir', async () => {
    mockedFindUnique.mockResolvedValueOnce(null)

    await expect(userService.getUserById(id)).rejects.toBeInstanceOf(NotFoundError)

    expect(mockedFindUnique).toHaveBeenCalledWith({
      where: {
        id,
      },
    })
  })

  it('deve registrar o erro no console quando o Prisma falhar', async () => {
    const dbError = new Error('Falha no banco')

    mockedFindUnique.mockRejectedValueOnce(dbError)

    const consoleSpy = jest.spyOn(console, 'error')

    await expect(userService.getUserById(id)).rejects.toBeInstanceOf(InternalServerError)

    expect(consoleSpy).toHaveBeenCalledTimes(1)

    expect(consoleSpy).toHaveBeenCalledWith('Error to find user:', dbError)
  })

  it('deve lançar InternalServerError com a mensagem correta quando ocorrer erro no banco', async () => {
    mockedFindUnique.mockRejectedValueOnce(new Error('Erro inesperado'))

    await expect(userService.getUserById(id)).rejects.toThrow(
      'Erro interno ao buscar usuário no banco de dados por id',
    )
  })
})
