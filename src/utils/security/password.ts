import bcrypt from 'bcrypt'

export async function hashPassword(password: string) {
  const saltHounds = 10
  return await bcrypt.hash(password, saltHounds)
}

export async function comparePasswords(passwordProvided: string, passwordHash: string) {
  return await bcrypt.compare(passwordProvided, passwordHash)
}
