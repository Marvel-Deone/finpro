import { NextResponse } from 'next/server'
import {
  getExamById,
  updateExam,
  deleteExam,
} from '@/services/exam.service'
import { updateExamSchema } from '@/validations/exam.schema'
import { verifyToken } from '@/lib/jwt'
import { cookies } from 'next/headers'
import { verifyOrgOwnership } from '@/lib/auth'

/**
 * GET single exam
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const orgId = searchParams.get('orgId')

    if (!orgId) {
      return NextResponse.json(
        { error: 'orgId is required' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token) as { userId: string }

    await verifyOrgOwnership(decoded.userId, orgId)

    const exam = await getExamById(params.id, orgId)

    return NextResponse.json(exam)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    )
  }
}

/**
 * UPDATE exam
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const orgId = searchParams.get('orgId')

    if (!orgId) {
      return NextResponse.json(
        { error: 'orgId is required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validated = updateExamSchema.parse(body)

    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token) as { userId: string }

    await verifyOrgOwnership(decoded.userId, orgId)

    const exam = await updateExam(params.id, orgId, validated)

    return NextResponse.json({
      message: 'Exam updated successfully',
      exam,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}

/**
 * DELETE exam
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const orgId = searchParams.get('orgId')

    if (!orgId) {
      return NextResponse.json(
        { error: 'orgId is required' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token) as { userId: string }

    await verifyOrgOwnership(decoded.userId, orgId)

    await deleteExam(params.id, orgId)

    return NextResponse.json({
      message: 'Exam deleted successfully',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}