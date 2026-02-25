// // import prisma from '@/lib/prisma'

// import { prisma } from "@/lib/prisma"

// export async function createStock(data: any, userId: string) {
//   return prisma.stock.create({
//     data: {
//       ...data,
//       userId,
//     },
//   })
// }

// export async function getStocks(userId: string) {
//   return prisma.stock.findMany({
//     where: { userId },
//     orderBy: { id: 'desc' },
//   })
// }

// export async function updateStock(
//   id: string,
//   data: any,
//   userId: string
// ) {
//   return prisma.stock.updateMany({
//     where: { id, userId }, // prevents editing others' stock
//     data,
//   })
// }

// export async function deleteStock(id: string, userId: string) {
//   return prisma.stock.deleteMany({
//     where: { id, userId }, // prevents deleting others' stock
//   })
// }


import { prisma } from "@/lib/prisma"

/**
 * Create Stock
 */
export async function createStock(data: any, orgId: string) {
  return prisma.stock.create({
    data: {
      ...data,
      orgId, // ✅ use orgId
    },
  })
}

/**
 * Get all stocks for org
 */
export async function getStocks(orgId: string) {
  return prisma.stock.findMany({
    where: { orgId },
    orderBy: { id: "desc" },
  })
}

/**
 * Update stock (scoped)
 */
export async function updateStock(
  id: string,
  orgId: string,
  data: any
) {
  return prisma.stock.updateMany({
    where: { id, orgId },
    data,
  })
}

/**
 * Delete stock (scoped)
 */
export async function deleteStock(id: string, orgId: string) {
  return prisma.stock.deleteMany({
    where: { id, orgId },
  })
}