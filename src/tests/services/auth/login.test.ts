import { userService } from '../../../services/user.service.js'
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { makePrismaUser } from '../user/user.fixtures.js'
import { loginUserSchema } from '../../../schemas/auth.schema.js'
import { authService } from '../../../services/auth.service.js'
import { makeSessionResponse, makeLogin } from './auth.fixtures.js'
import * as tokenUtils from '../../../utils/security/token.js'
import { comparePasswords } from '../../../utils/security/password.js'

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    session: {
      create: jest.fn(),
    },
  },
}))

jest.mock('../../../services/user.service', () => ({
  userService: {
    getUserByEmail: jest.fn(),
  },
}))

jest.mock('../../../utils/security/password', () => ({
  comparePasswords: jest.fn(),
}))

const mockedGetUserByEmail = userService.getUserByEmail as jest.MockedFunction<
  typeof userService.getUserByEmail
>

const mockedComparePasswords = comparePasswords as jest.MockedFunction<typeof comparePasswords>

describe('AuthService.login', () => {
  beforeEach(() => {
    mockedGetUserByEmail.mockReset()
    mockedComparePasswords.mockReset()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Validação do schema', () => {
    it('deve executar o parse uma única vez', async () => {
      const parseSpy = jest.spyOn(loginUserSchema, 'parse')

      mockedGetUserByEmail.mockResolvedValue(makePrismaUser())
      mockedComparePasswords.mockResolvedValue(true)

      jest.spyOn(tokenUtils, 'generateToken').mockReturnValue('token')
      jest.spyOn(authService, 'createSession').mockResolvedValue(makeSessionResponse())

      await authService.login(makeLogin())

      expect(parseSpy).toHaveBeenCalledTimes(1)
      expect(parseSpy).toHaveBeenCalledWith(makeLogin())
    })
  })

  it('deve lançar NotFoundError quando usuário não existir', async () => {
    mockedGetUserByEmail.mockResolvedValue(null)

    await expect(authService.login(makeLogin())).rejects.toThrow('Usuário não encontrado')
  })

  it('deve lançar UnauthorizedError quando a senha for inválida', async () => {
    mockedGetUserByEmail.mockResolvedValue(makePrismaUser())

    mockedComparePasswords.mockResolvedValue(false)

    await expect(authService.login(makeLogin())).rejects.toThrow('Credenciais inválidas')
  })

  it('deve criar sessão e retornar token', async () => {
    mockedGetUserByEmail.mockResolvedValue(makePrismaUser())

    mockedComparePasswords.mockResolvedValue(true)

    jest.spyOn(tokenUtils, 'generateToken').mockReturnValue('token')

    const createSessionSpy = jest
      .spyOn(authService, 'createSession')
      .mockResolvedValue(makeSessionResponse())

    const result = await authService.login(makeLogin())

    expect(result).toEqual({
      token: 'token',
    })

    expect(createSessionSpy).toHaveBeenCalledWith(1, 'token')
  })
})
