import { prisma } from '@/lib/prisma'

export async function createExam(
  data: {
    category: string
    session_name: string
    total_candidates: number
    document_proof: string
  },
  userId: string
) {
  return prisma.exam.create({
    data: {
      ...data,
      userId,
    },
  })
}

export async function getExams(userId?: string) {
  return prisma.exam.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { created_at: 'desc' },
  })
}

export async function getExamById(id: string) {
  const exam = await prisma.exam.findUnique({
    where: { id },
  })

  if (!exam) {
    throw new Error('Exam not found')
  }

  return exam
}

export async function updateExam(
  id: string,
  data: Partial<{
    category: string
    session_name: string
    total_candidates: number
    document_proof: string
  }>
) {
  return prisma.exam.update({
    where: { id },
    data,
  })
}

export async function deleteExam(id: string) {
  return prisma.exam.delete({
    where: { id },
  })
}