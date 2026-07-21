import type { CreateUserInput } from '../../../schemas/user.schema'

export const makeUser = (overrides: Partial<CreateUserInput> = {}): CreateUserInput => ({
  name: 'Lucas Fidelis',
  email: 'lucas@example.com',
  password: 'senha-forte-123',
  ...overrides,
})

export const buildEmailWithLength = (length: number): string => {
  const domain = '@ex.com'
  return 'a'.repeat(length - domain.length) + domain
}
