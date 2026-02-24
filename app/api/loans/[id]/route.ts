import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { deleteLoan } from '@/services/loan.service'

async function getUserIdFromCookie() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) throw new Error('Unauthorized');
    const decoded = verifyToken(token) as { userId: string };
    return decoded.userId;
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getUserIdFromCookie()
        await deleteLoan(params.id, userId)

        return NextResponse.json({ message: 'Deleted' })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        )
    }
}