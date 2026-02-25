// // import prisma from '@/lib/prisma'

// import { prisma } from "@/lib/prisma"

// export async function createLoan(data: any, userId: string) {
//     return prisma.loan.create({
//         data: {
//             ledger_identity: data.ledger_identity,
//             operational_narrative: data.operational_narrative,
//             principal: data.principal,
//             term: data.term,
//             category: data.category ?? "Loan",
//             liability_proof: data.liability_proof,
//             userId,
//         },
//     })
// }

// export async function getLoans(userId: string) {
//     return prisma.loan.findMany({
//         where: { userId },
//         orderBy: { createdAt: 'desc' },
//     })
// }

// export async function deleteLoan(id: string, userId: string) {
//     return prisma.loan.deleteMany({
//         where: { id, userId },
//     })
// }

import { prisma } from "@/lib/prisma"

/**
 * Create Loan (org scoped)
 */
export async function createLoan(data: any, orgId: string) {
  return prisma.loan.create({
    data: {
      ledger_identity: data.ledger_identity,
      operational_narrative: data.operational_narrative,
      principal: data.principal,
      term: data.term,
      category: data.category ?? "Loan",
      liability_proof: data.liability_proof,
      orgId, // use orgId
    },
  })
}

/**
 * Get all loans for an org
 */
export async function getLoans(orgId: string) {
  return prisma.loan.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
  })
}

/**
 * Delete loan (scoped)
 */
export async function deleteLoan(id: string, orgId: string) {
  return prisma.loan.deleteMany({
    where: { id, orgId },
  })
}