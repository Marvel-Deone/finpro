// import prisma from '@/lib/prisma'

import { prisma } from "@/lib/prisma"

export async function createStock(data: any, userId: string) {
  return prisma.stock.create({
    data: {
      ...data,
      userId,
    },
  })
}

export async function getStocks(userId: string) {
  return prisma.stock.findMany({
    where: { userId },
    orderBy: { id: 'desc' },
  })
}

export async function updateStock(
  id: string,
  data: any,
  userId: string
) {
  return prisma.stock.updateMany({
    where: { id, userId }, // prevents editing others' stock
    data,
  })
}

export async function deleteStock(id: string, userId: string) {
  return prisma.stock.deleteMany({
    where: { id, userId }, // prevents deleting others' stock
  })
}