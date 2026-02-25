import { prisma } from "@/lib/prisma"

//  Create Stock
export async function createStock(data: any, orgId: string) {
  return prisma.stock.create({
    data: {
      ...data,
      orgId, // ✅ use orgId
    },
  })
}

//  Get all stocks for org
export async function getStocks(orgId: string) {
  return prisma.stock.findMany({
    where: { orgId },
    orderBy: { id: "desc" },
  })
}

//  Update stock (scoped)
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

//  Delete stock (scoped)
export async function deleteStock(id: string, orgId: string) {
  return prisma.stock.deleteMany({
    where: { id, orgId },
  })
}