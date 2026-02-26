import { NextRequest, NextResponse } from "next/server";
import { createExam, getExams } from "@/services/exam.service";
import { createExamSchema } from "@/validations/exam.schema";
import { getAuthenticatedUser, verifyOrgOwnership } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json(
        { error: "orgId is required" },
        { status: 400 }
      );
    }

    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await verifyOrgOwnership(user.id, orgId);

    const exams = await getExams(orgId);

    return NextResponse.json(exams);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { orgId, ...examData } = body;

    if (!orgId) {
      return NextResponse.json(
        { error: "orgId is required" },
        { status: 400 }
      );
    }

    const validated = createExamSchema.parse(examData);

    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await verifyOrgOwnership(user.id, orgId);

    const exam = await createExam(validated, orgId);

    return NextResponse.json(
      {
        message: "Exam created successfully",
        exam,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Invalid request data" },
      { status: 400 }
    );
  }
}