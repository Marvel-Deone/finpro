import { NextResponse } from 'next/server'
import { loginUser } from '@/services/auth.service'
import { loginSchema } from '@/validations/auth.schema'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { identity, password } = loginSchema.parse(body)

    const { user, token } = await loginUser(identity, password)

    const response = NextResponse.json({
      message: 'Login successful',
      user: { id: user.id, identity: user.identity },
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}