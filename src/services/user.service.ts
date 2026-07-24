import type { User } from '../generated/prisma/client.js'
import { prisma } from '../lib/prisma.js'
import type { CreatedUserResponse } from '../schemas/user.schema.js'
import { createUserSchema, type CreateUserInput } from '../schemas/user.schema.js'
import { ConflictError, InternalServerError, NotFoundError } from '../utils/errors/httpErrors.js'
import { hashPassword } from '../utils/security/password.js'
import { toUserResponse } from '../utils/to-user-response.js'

class UserService {
  async createUser(userData: CreateUserInput): Promise<CreatedUserResponse | void> {
    createUserSchema.parse(userData)

    const existingUser = await this.getUserByEmail(userData.email)
    if (existingUser) {
      throw new ConflictError('Não é possível criar um usuário com este e-mail')
    }

    try {
      const passwordHash = await hashPassword(userData.password)
      const createdUser = await prisma.user.create({
        data: {
          ...userData,
          email: userData.email.toLowerCase(),
          password: passwordHash,
        },
      })
      return toUserResponse(createdUser)
    } catch (error) {
      console.error('Error creating user:', error)
      throw new InternalServerError('Erro interno ao criar usuário no banco de dados')
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    email = email.toLowerCase()
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

  async getUserById(id: number): Promise<User | null> {
    let user
    try {
      user = await prisma.user.findUnique({
        where: { id },
      })
    } catch (error) {
      console.error('Error to find user:', error)
      throw new InternalServerError('Erro interno ao buscar usuário no banco de dados por id')
    }

    if (!user) {
      throw new NotFoundError('Usuário não encontrado')
    }

    return user
  }
}

export const userService = new UserService()
