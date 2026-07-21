import { describe, it, expect, jest, beforeEach } from '@jest/globals'

import { userService } from '../../../services/user.service'
import type { User } from '../../../generated/prisma/client'
import { InternalServerError } from '../../../utils/errors/httpErrors'
import { makeUser } from './user.fixtures'
import { prisma } from '../../../lib/prisma'

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

describe('UserService.getUserByEmail', () => {
  const email = 'lucas@example.com'

  beforeEach(() => {
    mockedFindUnique.mockReset()
  })

  it('deve buscar o usuário pelo e-mail informado', async () => {
    const user: User = {
      id: 1,
      createdAt: new Date(),
      ...makeUser({ email }),
    }

    mockedFindUnique.mockResolvedValueOnce(user)

    const result = await userService.getUserByEmail(email)

    expect(result).toEqual(user)

    expect(mockedFindUnique).toHaveBeenCalledTimes(1)

    expect(mockedFindUnique).toHaveBeenCalledWith({
      where: {
        email,
      },
    })
  })

  it('deve retornar null quando o usuário não existir', async () => {
    mockedFindUnique.mockResolvedValueOnce(null)

    const result = await userService.getUserByEmail(email)

    expect(result).toBeNull()

    expect(mockedFindUnique).toHaveBeenCalledWith({
      where: {
        email,
      },
    })
  })

  it('deve registrar o erro no console quando o Prisma falhar', async () => {
    const dbError = new Error('Falha no banco')

    mockedFindUnique.mockRejectedValueOnce(dbError)

    const consoleSpy = jest.spyOn(console, 'error')

    await expect(userService.getUserByEmail(email)).rejects.toBeInstanceOf(InternalServerError)

    expect(consoleSpy).toHaveBeenCalledTimes(1)

    expect(consoleSpy).toHaveBeenCalledWith('Error to find user:', dbError)
  })

  it('deve lançar InternalServerError com a mensagem correta quando ocorrer erro no banco', async () => {
    mockedFindUnique.mockRejectedValueOnce(new Error('Erro inesperado'))

    await expect(userService.getUserByEmail(email)).rejects.toThrow(
      'Erro interno ao buscar usuário no banco de dados por e-mail',
    )
  })
})
