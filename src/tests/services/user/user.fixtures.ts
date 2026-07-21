import type { User } from '../../../generated/prisma/client'
import type { CreatedUserResponse, CreateUserInput } from '../../../schemas/user.schema'

export const makeUser = (overrides: Partial<CreateUserInput> = {}): CreateUserInput => ({
  name: 'Lucas Fidelis',
  email: 'lucas@example.com',
  password: 'senha-forte-123',
  ...overrides,
})

export const makePrismaUser = (overrides?: Partial<User>): User => ({
  id: 1,
  name: 'Lucas',
  email: 'lucas@email.com',
  password: '12345678',
  createdAt: new Date(),
  ...overrides,
})

export const makeCreatedUser = (prismaUser: User): CreatedUserResponse => ({
  ...prismaUser,
  createdAt: prismaUser.createdAt.toISOString(),
})

export const buildEmailWithLength = (length: number): string => {
  const domain = '@ex.com'
  return 'a'.repeat(length - domain.length) + domain
}
