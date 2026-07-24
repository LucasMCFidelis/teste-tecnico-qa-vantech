import { describe, expect, it } from '@jest/globals'

import { hashPassword, comparePasswords } from '../../../utils/security/password.js'

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('deve gerar um hash diferente da senha original', async () => {
      const password = '12345678'

      const hash = await hashPassword(password)

      expect(hash).not.toBe(password)
    })

    it('deve gerar um hash não vazio', async () => {
      const hash = await hashPassword('12345678')

      expect(hash).toBeTruthy()
      expect(hash.length).toBeGreaterThan(0)
    })

    it('deve gerar hashes diferentes para a mesma senha', async () => {
      const password = '12345678'

      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('comparePasswords', () => {
    it('deve retornar true quando a senha for válida', async () => {
      const password = '12345678'

      const hash = await hashPassword(password)

      await expect(comparePasswords(password, hash)).resolves.toBe(true)
    })

    it('deve retornar false quando a senha for inválida', async () => {
      const hash = await hashPassword('12345678')

      await expect(comparePasswords('senha-incorreta', hash)).resolves.toBe(false)
    })
  })
})
