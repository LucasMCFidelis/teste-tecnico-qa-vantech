import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'

import { authService } from '../../../services/auth.service.js'
import { InternalServerError } from '../../../utils/errors/http-errors.js'
import { makePrismaSession } from './auth.fixtures.js'

jest.mock('../../../lib/prisma', () => ({
  prisma: {},
}))

describe('AuthService.logout', () => {
  const token = 'token-test'

  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Erro interno', () => {
    it('deve propagar o erro ao buscar a sessão', async () => {
      jest
        .spyOn(authService, 'getSessionByToken')
        .mockRejectedValueOnce(new InternalServerError('Erro interno'))

      await expect(authService.logout(token)).rejects.toBeInstanceOf(InternalServerError)

      expect(authService.getSessionByToken).toHaveBeenCalledWith(token)
    })

    it('deve propagar o erro ao invalidar a sessão', async () => {
      const session = makePrismaSession({ id: 1 })

      jest.spyOn(authService, 'getSessionByToken').mockResolvedValueOnce(session)

      jest
        .spyOn(authService, 'invalidateSession')
        .mockRejectedValueOnce(new InternalServerError('Erro interno'))

      await expect(authService.logout(token)).rejects.toBeInstanceOf(InternalServerError)

      expect(authService.invalidateSession).toHaveBeenCalledWith(session.id)
    })
  })

  describe('Caminho feliz', () => {
    it('deve buscar a sessão e invalidá-la', async () => {
      const session = makePrismaSession({ id: 1 })

      const getSessionSpy = jest
        .spyOn(authService, 'getSessionByToken')
        .mockResolvedValueOnce(session)

      const invalidateSpy = jest.spyOn(authService, 'invalidateSession').mockResolvedValueOnce()

      await authService.logout(token)

      expect(getSessionSpy).toHaveBeenCalledTimes(1)
      expect(getSessionSpy).toHaveBeenCalledWith(token)

      expect(invalidateSpy).toHaveBeenCalledTimes(1)
      expect(invalidateSpy).toHaveBeenCalledWith(session.id)
    })
  })
})
