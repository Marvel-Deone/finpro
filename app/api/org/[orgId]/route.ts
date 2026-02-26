import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { deleteOrg, getOrgById, updateOrg } from "@/services/org.service";
import { updateOrgSchema } from "@/validations/org.schema";

// GET /api/org/[id]
export async function GET(
  request: NextRequest,
  // context: { params: { id: string } } // plain object, NOT Promise
  // context: { params: { orgId: string } }
  context: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId: id } = await context.params; //

    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const org = await getOrgById(user.id, id);

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json(org);
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Failed to fetch organization" }, { status: 400 });
  }
}

// PATCH /api/org/[id]
export async function PATCH(
  request: NextRequest,
  // context: { params: { id: string } } // plain object
 context: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await context.params;

    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateOrgSchema.parse(body);

    const org = await updateOrg(user.id, orgId, validated.name);

    return NextResponse.json(org);
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Failed to update organization" }, { status: 400 });
  }
}

// DELETE /api/org/[id]
export async function DELETE(
  request: NextRequest,
  // context: { params: { id: string } } // plain object
  // context: { params: { orgId: string } }
  context: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await context.params;

    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteOrg(user.id, orgId);

    return NextResponse.json({ message: "Organization deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Failed to delete organization" }, { status: 400 });
  }
}