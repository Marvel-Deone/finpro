import { NextResponse } from 'next/server'
import {
  getExamById,
  updateExam,
  deleteExam,
} from '@/services/exam.service'
import { updateExamSchema } from '@/validations/exam.schema'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const exam = await getExamById(params.id)
    return NextResponse.json(exam)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const validated = updateExamSchema.parse(body)

    const exam = await updateExam(params.id, validated)

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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteExam(params.id)

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