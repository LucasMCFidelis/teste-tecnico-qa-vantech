import type { User } from '../../generated/prisma/client.js'
import type { CreatedUserResponse } from '../../schemas/user.schema.js'

export function toUserResponse(user: User): CreatedUserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  }
}
