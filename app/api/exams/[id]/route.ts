import { NextRequest, NextResponse } from "next/server";
import {
  getExamById,
  updateExam,
  deleteExam,
} from "@/services/exam.service";
import { updateExamSchema } from "@/validations/exam.schema";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { verifyOrgOwnership } from "@/lib/auth";

// GET single exam
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json(
        { error: "orgId is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token) as { userId: string };

    await verifyOrgOwnership(decoded.userId, orgId);

    const exam = await getExamById(id, orgId);

    return NextResponse.json(exam);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Exam not found" },
      { status: 404 }
    );
  }
}

// UPDATE exam
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json(
        { error: "orgId is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = updateExamSchema.parse(body);

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token) as { userId: string };

    await verifyOrgOwnership(decoded.userId, orgId);

    const exam = await updateExam(id, orgId, validated);

    return NextResponse.json({
      message: "Exam updated successfully",
      exam,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Invalid request data" },
      { status: 400 }
    );
  }
}

// DELETE exam
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json(
        { error: "orgId is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token) as { userId: string };

    await verifyOrgOwnership(decoded.userId, orgId);

    await deleteExam(id, orgId);

    return NextResponse.json({
      message: "Exam deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Failed to delete exam" },
      { status: 400 }
    );
  }
}