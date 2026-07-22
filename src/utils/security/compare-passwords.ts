import bcrypt from 'bcrypt'

export async function comparePasswords(passwordProvided: string, passwordHash: string) {
  return await bcrypt.compare(passwordProvided, passwordHash)
}
