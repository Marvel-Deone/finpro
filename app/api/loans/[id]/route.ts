// import { NextResponse } from 'next/server'
// import { cookies } from 'next/headers'
// import { verifyToken } from '@/lib/jwt'
// import { deleteLoan } from '@/services/loan.service'

// async function getUserIdFromCookie() {
//     const cookieStore = await cookies();
//     const token = cookieStore.get('token')?.value;
//     if (!token) throw new Error('Unauthorized');
//     const decoded = verifyToken(token) as { userId: string };
//     return decoded.userId;
// }

// export async function DELETE(
//     req: Request,
//     { params }: { params: { id: string } }
// ) {
//     try {
//         const userId = await getUserIdFromCookie()
//         await deleteLoan(params.id, userId)

//         return NextResponse.json({ message: 'Deleted' })
//     } catch (error: any) {
//         return NextResponse.json(
//             { error: error.message },
//             { status: 400 }
//         )
//     }
// }


import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { deleteLoan } from "@/services/loan.service"
import { verifyOrgOwnership } from "@/lib/auth"

async function getUserIdFromCookie() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) throw new Error("Unauthorized")

  const decoded = verifyToken(token) as any
  const userId =
    decoded?.userId ?? decoded?.id ?? decoded?.sub ?? decoded?.user?.id

  if (!userId || typeof userId !== "string") {
    throw new Error("Unauthorized")
  }

  return userId
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const orgId = searchParams.get("orgId")

    if (!orgId) {
      return NextResponse.json(
        { error: "orgId is required" },
        { status: 400 }
      )
    }

    const userId = await getUserIdFromCookie()

    // 🔒 verify org ownership
    await verifyOrgOwnership(userId, orgId)

    await deleteLoan(params.id, orgId)

    return NextResponse.json({ message: "Deleted" })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}