import { prisma } from "@/lib/prisma"

/**
 * Create Organization
 */
export async function createOrg(userId: string, name: string) {
  return prisma.org.create({
    data: {
      name,
      userId,
    },
  })
}

/**
 * Get all orgs for a user
 */
export async function getUserOrgs(userId: string) {
  return prisma.org.findMany({
    where: { userId },
    orderBy: { created_at: "asc" },
  })
}

/**
 * Get single org (scoped to user)
 */
export async function getOrgById(userId: string, orgId: string) {
  return prisma.org.findFirst({
    where: {
      id: orgId,
      userId,
    },
  })
}

/**
 * Update org (scoped)
 */
export async function updateOrg(
  userId: string,
  orgId: string,
  name: string
) {
  const org = await getOrgById(userId, orgId)

  if (!org) {
    throw new Error("Organization not found or unauthorized")
  }

  return prisma.org.update({
    where: { id: orgId },
    data: { name },
  })
}

/**
 * Delete org (scoped)
 */
export async function deleteOrg(userId: string, orgId: string) {
  const org = await getOrgById(userId, orgId)

  if (!org) {
    throw new Error("Organization not found or unauthorized")
  }

  return prisma.org.delete({
    where: { id: orgId },
  })
}