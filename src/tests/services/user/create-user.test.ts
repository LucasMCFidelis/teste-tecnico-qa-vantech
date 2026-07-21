import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { z } from 'zod'

import { userService } from '../../../services/user.service'

import { createUserSchema } from '../../../schemas/user.schema'
import type { CreateUserInput } from '../../../schemas/user.schema'
import type { User } from '../../../generated/prisma/client'
import { InternalServerError } from '../../../utils/errors/httpErrors'
import { buildEmailWithLength, makeUser } from './user.fixtures'
import { prisma } from '../../../lib/prisma'

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
    },
  },
}))

const mockedCreate = prisma.user.create as jest.MockedFunction<typeof prisma.user.create>

describe('UserService.createUser', () => {
  let parseSpy: ReturnType<typeof jest.spyOn>
  beforeEach(() => {
    parseSpy = jest.spyOn(createUserSchema, 'parse')

    jest.spyOn(console, 'error').mockImplementation(() => undefined)

    mockedCreate.mockReset()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Validação do schema', () => {
    it('deve validar os dados exatamente uma vez', async () => {
      mockedCreate.mockResolvedValueOnce({} as User)

      await userService.createUser(makeUser())

      expect(parseSpy).toHaveBeenCalledTimes(1)
      expect(parseSpy).toHaveBeenCalledWith(makeUser())
    })

    it('não deve chamar o Prisma quando a validação falha', async () => {
      const invalidUser = makeUser({
        email: 'email-invalido',
      })

      await expect(userService.createUser(invalidUser)).rejects.toBeInstanceOf(z.ZodError)

      expect(mockedCreate).not.toHaveBeenCalled()
    })

    it('deve executar o parse apenas uma vez mesmo quando ocorre erro de validação', async () => {
      await expect(
        userService.createUser(
          makeUser({
            name: 'a',
          }),
        ),
      ).rejects.toBeInstanceOf(z.ZodError)

      expect(parseSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('Dados inválidos', () => {
    it('rejeita e-mail inválido', async () => {
      await expect(
        userService.createUser(
          makeUser({
            email: 'email-invalido',
          }),
        ),
      ).rejects.toThrow('E-mail inválido')

      expect(mockedCreate).not.toHaveBeenCalled()
    })

    it.each([['name'], ['email'], ['password']])(
      'rejeita quando o campo %s está ausente',
      async (field) => {
        const invalidUser: Partial<CreateUserInput> = {
          ...makeUser(),
        }

        delete invalidUser[field as keyof CreateUserInput]

        await expect(userService.createUser(invalidUser as CreateUserInput)).rejects.toBeInstanceOf(
          z.ZodError,
        )

        expect(mockedCreate).not.toHaveBeenCalled()
      },
    )

    it('rejeita quando name possui tipo inválido', async () => {
      const invalidUser = {
        ...makeUser(),
        name: 123,
      } as unknown as CreateUserInput

      await expect(userService.createUser(invalidUser)).rejects.toBeInstanceOf(z.ZodError)

      expect(mockedCreate).not.toHaveBeenCalled()
    })

    it('rejeita quando o payload é null', async () => {
      await expect(
        userService.createUser(null as unknown as CreateUserInput),
      ).rejects.toBeInstanceOf(z.ZodError)

      expect(mockedCreate).not.toHaveBeenCalled()
    })
  })

  describe('Boundary Value Analysis', () => {
    describe('name', () => {
      it('aceita 2 caracteres (limite mínimo)', async () => {
        const createdUser = {} as User
        mockedCreate.mockResolvedValueOnce(createdUser)

        await expect(
          userService.createUser(
            makeUser({
              name: 'ab',
            }),
          ),
        ).resolves.toEqual(createdUser)
      })

      it('aceita 100 caracteres (limite máximo)', async () => {
        const createdUser = {} as User
        mockedCreate.mockResolvedValueOnce(createdUser)

        await expect(
          userService.createUser(
            makeUser({
              name: 'a'.repeat(100),
            }),
          ),
        ).resolves.toEqual(createdUser)
      })

      it('rejeita 101 caracteres (acima do máximo)', async () => {
        await expect(
          userService.createUser(
            makeUser({
              name: 'a'.repeat(101),
            }),
          ),
        ).rejects.toThrow('Nome muito longo')

        expect(mockedCreate).not.toHaveBeenCalled()
      })
    })

    describe('email', () => {
      it('aceita 150 caracteres (limite máximo)', async () => {
        const createdUser = {} as User
        mockedCreate.mockResolvedValueOnce(createdUser)

        await expect(
          userService.createUser(
            makeUser({
              email: buildEmailWithLength(150),
            }),
          ),
        ).resolves.toEqual(createdUser)
      })

      it('rejeita 151 caracteres (acima do máximo)', async () => {
        await expect(
          userService.createUser(
            makeUser({
              email: buildEmailWithLength(151),
            }),
          ),
        ).rejects.toThrow('E-mail muito longo')

        expect(mockedCreate).not.toHaveBeenCalled()
      })
    })

    describe('password', () => {
      it('aceita 8 caracteres (limite mínimo)', async () => {
        const createdUser = {} as User
        mockedCreate.mockResolvedValueOnce(createdUser)

        await expect(
          userService.createUser(
            makeUser({
              password: '12345678',
            }),
          ),
        ).resolves.toEqual(createdUser)
      })

      it('aceita 72 caracteres (limite máximo)', async () => {
        const createdUser = {} as User
        mockedCreate.mockResolvedValueOnce(createdUser)

        await expect(
          userService.createUser(
            makeUser({
              password: 'a'.repeat(72),
            }),
          ),
        ).resolves.toEqual(createdUser)
      })

      it('rejeita 73 caracteres (acima do máximo)', async () => {
        await expect(
          userService.createUser(
            makeUser({
              password: 'a'.repeat(73),
            }),
          ),
        ).rejects.toThrow('Senha muito longa')

        expect(mockedCreate).not.toHaveBeenCalled()
      })
    })
  })

  describe('Erro interno do banco', () => {
    it('deve registrar o erro no console e lançar InternalServerError', async () => {
      const userData = makeUser()
      const dbError = new Error('Falha no banco')

      mockedCreate.mockRejectedValueOnce(dbError)

      const consoleSpy = jest.spyOn(console, 'error')

      await expect(userService.createUser(userData)).rejects.toBeInstanceOf(InternalServerError)

      expect(consoleSpy).toHaveBeenCalledTimes(1)

      expect(consoleSpy).toHaveBeenCalledWith('Error creating user:', dbError)
    })

    it('deve lançar InternalServerError com a mensagem correta', async () => {
      mockedCreate.mockRejectedValueOnce(new Error('Erro inesperado'))

      await expect(userService.createUser(makeUser())).rejects.toThrow(
        'Erro interno ao criar usuário no banco de dados',
      )
    })
  })

  describe('Caminho feliz', () => {
    it('retorna o usuário criado e envia os dados corretamente ao Prisma', async () => {
      const userData = makeUser()

      const createdUser: User = {
        id: 1,
        createdAt: new Date(),
        ...userData,
      }

      mockedCreate.mockResolvedValueOnce(createdUser)

      const result = await userService.createUser(userData)

      expect(result).toEqual(createdUser)

      expect(mockedCreate).toHaveBeenCalledTimes(1)

      expect(mockedCreate).toHaveBeenCalledWith({
        data: userData,
      })
    })
  })
})
