import { NextResponse } from 'next/server'
import { createExam, getExams } from '@/services/exam.service'
import { createExamSchema } from '@/validations/exam.schema'
import { verifyToken } from '@/lib/jwt'
import { cookies } from 'next/headers'

// export async function GET() {
//   try {
//     const exams = await getExams()
//     return NextResponse.json(exams)
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 })
//   }
// }

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const decoded = verifyToken(token) as { userId: string }

        const exams = await getExams(decoded.userId)

        return NextResponse.json(exams)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        // Validate body
        const body = await req.json()
        const validated = createExamSchema.parse(body)

        // Get userId from cookie
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) throw new Error('Unauthorized')

        const decoded = verifyToken(token) as { userId: string }

        // Create exam with userId
        const exam = await createExam(validated, decoded.userId)

        return NextResponse.json({
            message: 'Exam created successfully',
            exam,
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        )
    }
}