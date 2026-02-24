import { z } from 'zod'

export const createExamSchema = z.object({
  session_name: z.string().min(2),
  category: z.string().min(2),
  total_candidates: z.number().int().positive(),
  document_proof: z.string().url(),
})

export const updateExamSchema = createExamSchema.partial()