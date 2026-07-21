import type { User } from '../generated/prisma/client'
import { prisma } from '../lib/prisma'
import { createUserSchema, type CreateUserInput } from '../schemas/user.schema'
import { InternalServerError } from '../utils/errors/httpErrors'

class UserService {
  async createUser(userData: CreateUserInput): Promise<User | void> {
    createUserSchema.parse(userData)

    try {
      const createdUser = await prisma.user.create({ data: userData })
      return createdUser
    } catch (error) {
      console.error('Error creating user:', error)
      throw new InternalServerError('Erro interno ao criar usuário no banco de dados')
    }
  }
}

export const userService = new UserService()
