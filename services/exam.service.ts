// import { prisma } from '@/lib/prisma'

// export async function createExam(
//   data: {
//     category: string
//     session_name: string
//     total_candidates: number
//     document_proof: string
//   },
//   userId: string,
//   orgId: string
// ) {
//   return prisma.exam.create({
//     data: {
//       ...data,
//     //   userId,
//       orgId,
//     },
//   })
// }

// export async function getExams(userId?: string, orgId?: string) {
//   return prisma.exam.findMany({
//     where: userId ? { orgId } : orgId ? { orgId } : undefined,
//     orderBy: { created_at: 'desc' },
//   })    
// }

// export async function getExamById(id: string) {
//   const exam = await prisma.exam.findUnique({
//     where: { id },
//   })

//   if (!exam) {
//     throw new Error('Exam not found')
//   }

//   return exam
// }

// export async function updateExam(
//   id: string,
//   data: Partial<{
//     category: string
//     session_name: string
//     total_candidates: number
//     document_proof: string
//   }>
// ) {
//   return prisma.exam.update({
//     where: { id },
//     data,
//   })
// }

// export async function deleteExam(id: string) {
//   return prisma.exam.delete({
//     where: { id },
//   })
// }


import { prisma } from '@/lib/prisma'


//  * Create Exam (org scoped)
export async function createExam(
    data: {
        category: string
        session_name: string
        total_candidates: number
        document_proof: string
    },
    orgId: string
) {
    return prisma.exam.create({
        data: {
            ...data,
            orgId,
        },
    })
}


//  Get all exams for an org
export async function getExams(orgId: string) {
    return prisma.exam.findMany({
        where: { orgId },
        orderBy: { created_at: "asc" },
    })
}


//  Get single exam (scoped)
export async function getExamById(id: string, orgId: string) {
    const exam = await prisma.exam.findFirst({
        where: {
            id,
            orgId,
        },
    })

    if (!exam) {
        throw new Error('Exam not found or unauthorized')
    }

    return exam
}


//  Update exam (scoped)
export async function updateExam(
    id: string,
    orgId: string,
    data: Partial<{
        category: string
        session_name: string
        total_candidates: number
        document_proof: string
    }>
) {
    await getExamById(id, orgId)

    return prisma.exam.update({
        where: { id },
        data,
    })
}


// Delete exam (scoped)
export async function deleteExam(id: string, orgId: string) {
    await getExamById(id, orgId)

    return prisma.exam.delete({
        where: { id },
    })
}