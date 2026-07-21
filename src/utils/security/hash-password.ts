import bcrypt from 'bcrypt'

export async function hashPassword(password: string) {
  const saltHounds = 10
  return await bcrypt.hash(password, saltHounds)
}
