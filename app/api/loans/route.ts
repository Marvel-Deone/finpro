import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { createLoan, getLoans } from "@/services/loan.service";
import { verifyOrgOwnership } from "@/lib/auth";

//  Extract userId from JWT cookie

async function getUserIdFromCookie() {
  const cookieStore = await cookies(); // cookies() is synchronous in Next 16
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Unauthorized");

  const decoded = verifyToken(token) as any;

  const userId =
    decoded?.userId ?? decoded?.id ?? decoded?.sub ?? decoded?.user?.id;

  if (!userId || typeof userId !== "string") {
    throw new Error("Unauthorized: invalid token payload");
  }

  return userId;
}

/**
 * GET loans (org scoped)
 */
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

    const userId = await getUserIdFromCookie();

    // verify org belongs to logged-in user
    await verifyOrgOwnership(userId, orgId);

    const loans = await getLoans(orgId);

    return NextResponse.json(loans);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Unauthorized" },
      { status: 401 }
    );
  }
}

/**
 * CREATE loan (org scoped)
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromCookie();
    const body = await request.json();

    const { orgId, ...loanData } = body;

    if (!orgId) {
      return NextResponse.json(
        { error: "orgId is required" },
        { status: 400 }
      );
    }

    // verify org ownership
    await verifyOrgOwnership(userId, orgId);

    const loan = await createLoan(loanData, orgId);

    return NextResponse.json(loan, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Invalid request" },
      { status: 400 }
    );
  }
}