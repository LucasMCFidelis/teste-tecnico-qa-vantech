import { describe, it, expect } from '@jest/globals'
import { generateToken, hashToken } from '../../../utils/security/token.js'

describe('utils generateToken', () => {
  it('deve gerar um UUID válido', () => {
    const token = generateToken()

    expect(token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  })

  it('deve gerar tokens diferentes', () => {
    expect(generateToken()).not.toBe(generateToken())
  })
})

describe('utils hashToken', () => {
  it('deve gerar sempre o mesmo hash para o mesmo token', () => {
    const token = 'token-test'

    const hash1 = hashToken(token)
    const hash2 = hashToken(token)

    expect(hash1).toBe(hash2)
  })

  it('deve gerar hashes diferentes para tokens diferentes', () => {
    const hash1 = hashToken('token-1')
    const hash2 = hashToken('token-2')

    expect(hash1).not.toBe(hash2)
  })

  it('deve retornar um hash SHA-256 hexadecimal', () => {
    const hash = hashToken('token-test')

    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('não deve retornar o próprio token', () => {
    const token = 'token-test'

    expect(hashToken(token)).not.toBe(token)
  })

  it('deve produzir um hash com 64 caracteres', () => {
    expect(hashToken('token-test')).toHaveLength(64)
  })
})
