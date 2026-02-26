// import { NextResponse } from "next/server"
// import { cookies } from "next/headers"
// import { verifyToken } from "@/lib/jwt"
// import {
//   createStock,
//   getStocks,
// } from "@/services/stock.service"
// import { verifyOrgOwnership } from "@/lib/auth"

// async function getUserIdFromCookie() {
//   const cookieStore = await cookies()
//   const token = cookieStore.get("token")?.value

//   if (!token) throw new Error("Unauthorized")

//   const decoded = verifyToken(token) as any
//   const userId =
//     decoded?.userId ?? decoded?.id ?? decoded?.sub ?? decoded?.user?.id

//   if (!userId || typeof userId !== "string") {
//     throw new Error("Unauthorized")
//   }

//   return userId
// }

// //  GET all stocks (org scoped)
// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url)
//     const orgId = searchParams.get("orgId")

//     if (!orgId) {
//       return NextResponse.json(
//         { error: "orgId is required" },
//         { status: 400 }
//       )
//     }

//     const userId = await getUserIdFromCookie()

//     // verify org ownership
//     await verifyOrgOwnership(userId, orgId)

//     const stocks = await getStocks(orgId)

//     return NextResponse.json(stocks)
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error.message },
//       { status: 401 }
//     )
//   }
// }

// //  CREATE stock (org scoped)
// export async function POST(req: Request) {
//   try {
//     const userId = await getUserIdFromCookie()
//     const body = await req.json()

//     const { orgId, ...stockData } = body

//     if (!orgId) {
//       return NextResponse.json(
//         { error: "orgId is required" },
//         { status: 400 }
//       )
//     }

//     // verify org ownership
//     await verifyOrgOwnership(userId, orgId)

//     const stock = await createStock(stockData, orgId)

//     return NextResponse.json(stock, { status: 201 })
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error.message },
//       { status: 400 }
//     )
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import {
  createStock,
  getStocks,
} from "@/services/stock.service";
import { verifyOrgOwnership } from "@/lib/auth";

async function getUserIdFromCookie() {
  const cookieStore = await cookies(); // no await
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Unauthorized");

  const decoded = verifyToken(token) as any;
  const userId =
    decoded?.userId ?? decoded?.id ?? decoded?.sub ?? decoded?.user?.id;

  if (!userId || typeof userId !== "string") {
    throw new Error("Unauthorized");
  }

  return userId;
}

// GET all stocks (org scoped)
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

    await verifyOrgOwnership(userId, orgId);

    const stocks = await getStocks(orgId);

    return NextResponse.json(stocks);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Unauthorized" },
      { status: 401 }
    );
  }
}

// CREATE stock (org scoped)
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromCookie();
    const body = await request.json();

    const { orgId, ...stockData } = body;

    if (!orgId) {
      return NextResponse.json(
        { error: "orgId is required" },
        { status: 400 }
      );
    }

    await verifyOrgOwnership(userId, orgId);

    const stock = await createStock(stockData, orgId);

    return NextResponse.json(stock, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Invalid request" },
      { status: 400 }
    );
  }
}