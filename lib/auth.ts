import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "./jwt"

export async function getAuthenticatedUser(req?: Request) {
    try {
        let token: string | undefined

        // Try cookies
        const cookieStore = await cookies()
        token = cookieStore.get("token")?.value

        // If no cookie, check Authorization header
        if (!token && req) {
            const authHeader = req.headers.get("authorization")

            if (authHeader?.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1]
            }
        }

        if (!token) return null

        const decoded = verifyToken(token) as { userId: string }

        return prisma.user.findUnique({
            where: { id: decoded.userId }
        })

    } catch {
        return null
    }
}


export async function verifyOrgOwnership(userId: string, orgId: string) {
    const org = await prisma.org.findFirst({
        where: {
            id: orgId,
            userId,
        },
    })

    if (!org) {
        throw new Error('Organization not found or unauthorized')
    }
}