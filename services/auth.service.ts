import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/jwt'

export async function registerUser(identity: string, password: string) {
  const existingUser = await prisma.user.findUnique({
    where: { identity },
  })

  if (existingUser) {
    throw new Error('User already exists')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      identity,
      password: hashedPassword,
    },
  })

  const token = signToken({ userId: user.id })

  return { user, token }
}

export async function loginUser(identity: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { identity },
  })

  if (!user) {
    throw new Error('Invalid credentials')
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new Error('Invalid credentials')
  }

  const token = signToken({ userId: user.id })

  return { user, token }
}