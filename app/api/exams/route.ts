import { NextResponse } from 'next/server'
import { createExam, getExams } from '@/services/exam.service'
import { createExamSchema } from '@/validations/exam.schema'
import { getAuthenticatedUser, verifyOrgOwnership } from '@/lib/auth'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const orgId = searchParams.get("orgId")

        if (!orgId) {
            return NextResponse.json(
                { error: "orgId is required" },
                { status: 400 }
            )
        }
        const user = await getAuthenticatedUser(req)

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // verify org belongs to user
        await verifyOrgOwnership(user.id, orgId)

        const exams = await getExams(orgId)

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
        const body = await req.json()

        // Extract orgId separately
        const { orgId, ...examData } = body

        if (!orgId) {
            return NextResponse.json(
                { error: "orgId is required" },
                { status: 400 }
            )
        }

        // Validate only exam fields (not orgId)
        const validated = createExamSchema.parse(examData)

        // Verify org belongs to logged-in user
        const user = await getAuthenticatedUser(req)

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        await verifyOrgOwnership(user.id, orgId)

        // Create exam using orgId (NOT userId)
        const exam = await createExam(validated, orgId)

        return NextResponse.json(
            {
                message: "Exam created successfully",
                exam,
            },
            { status: 201 }
        )
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        )
    }
}