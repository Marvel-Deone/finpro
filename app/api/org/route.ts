import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createOrg, getUserOrgs } from "@/services/org.service";
import { createOrgSchema } from "@/validations/org.schema";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = createOrgSchema.parse(body);

    const org = await createOrg(user.id, validated.name);

    return NextResponse.json(org, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Invalid request" },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const orgs = await getUserOrgs(user.id);

    return NextResponse.json(orgs);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Failed to fetch organizations" },
      { status: 400 }
    );
  }
}