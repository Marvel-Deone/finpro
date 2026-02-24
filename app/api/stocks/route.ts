import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import {
  createStock,
  getStocks,
} from '@/services/stock.service'

async function getUserIdFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) throw new Error('Unauthorized');
  const decoded = verifyToken(token) as { userId: string };
  return decoded.userId;
}

// GET all stocks
export async function GET() {
  try {
    const userId = await getUserIdFromCookie()
    const stocks = await getStocks(userId)

    return NextResponse.json(stocks)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    )
  }
}

// CREATE stock
export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromCookie()
    const body = await req.json()

    const stock = await createStock(body, userId)

    return NextResponse.json(stock)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}