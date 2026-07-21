import type { User } from '../generated/prisma/client'
import { prisma } from '../lib/prisma'
import { createUserSchema, type CreateUserInput } from '../schemas/user.schema'
import { ConflictError, InternalServerError } from '../utils/errors/httpErrors'

class UserService {
  async createUser(userData: CreateUserInput): Promise<User | void> {
    createUserSchema.parse(userData)

    const existingUser = await this.getUserByEmail(userData.email)
    if (existingUser) {
      throw new ConflictError('Não é possível criar um usuário com este e-mail')
    }

    try {
      const createdUser = await prisma.user.create({ data: userData })
      return createdUser
    } catch (error) {
      console.error('Error creating user:', error)
      throw new InternalServerError('Erro interno ao criar usuário no banco de dados')
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      })
      return user
    } catch (error) {
      console.error('Error to find user:', error)
      throw new InternalServerError('Erro interno ao buscar usuário no banco de dados por e-mail')
    }
  }
}

export const userService = new UserService()
