import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { createLoan, getLoans } from '@/services/loan.service'

// async function getUserIdFromCookie() {
//   const cookieStore = await cookies();
//   const token = cookieStore.get('token')?.value;
//   if (!token) throw new Error('Unauthorized');
//   const decoded = verifyToken(token) as { userId: string };
//   return decoded.userId;
// }

async function getUserIdFromCookie() {
  const cookieStore =  await cookies(); // no await needed in route handlers
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Unauthorized");

  const decoded = verifyToken(token) as any;

  const userId =
    decoded?.userId ?? decoded?.id ?? decoded?.sub ?? decoded?.user?.id;

  if (!userId || typeof userId !== "string") {
    throw new Error("Unauthorized: invalid token payload");
  }

  return userId;
}

export async function GET() {
  try {
    const userId = await getUserIdFromCookie()
    const loans = await getLoans(userId)
    return NextResponse.json(loans)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromCookie()
    const body = await req.json()

    const loan = await createLoan(body, userId)

    return NextResponse.json(loan)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}