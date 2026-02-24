import { z } from 'zod'

export const registerSchema = z.object({
  identity: z.string().min(3),
  password: z.string().min(6),
})

export const loginSchema = z.object({
  identity: z.string(),
  password: z.string(),
})