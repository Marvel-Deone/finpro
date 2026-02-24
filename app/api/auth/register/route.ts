import { NextResponse } from 'next/server'
import { registerUser } from '@/services/auth.service'
import { registerSchema } from '@/validations/auth.schema'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { identity, password } = registerSchema.parse(body)

    const { user, token } = await registerUser(identity, password)

    const response = NextResponse.json({
      message: 'User created successfully',
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