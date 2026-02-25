// // // import { getAuthenticatedUser } from "@/lib/auth"
// // // import { deleteOrg, getOrgById, updateOrg } from "@/services/org.service"
// // // import { updateOrgSchema } from "@/validations/org.schema"
// // // import { NextResponse } from "next/server"
// // // // import { updateOrgSchema } from "@/lib/validations/org.schema"
// // // // import {
// // // //   getOrgById,
// // // //   updateOrg,
// // // //   deleteOrg,
// // // // } from "@/lib/services/org.service"
// // // // import { getAuthenticatedUser } from "@/lib/auth"

// // // export async function GET(
// // //   req: Request,
// // //   { params }: { params: { orgId: string } }
// // // ) {
// // //   try {
// // //     const user = await getAuthenticatedUser()

// // //     if (!user) {
// // //       return NextResponse.json(
// // //         { error: "Unauthorized" },
// // //         { status: 401 }
// // //       )
// // //     }

// // //     const org = await getOrgById(user.id, params.orgId)

// // //     if (!org) {
// // //       return NextResponse.json(
// // //         { error: "Organization not found" },
// // //         { status: 404 }
// // //       )
// // //     }

// // //     return NextResponse.json(org)
// // //   } catch (error: any) {
// // //     return NextResponse.json(
// // //       { error: error.message },
// // //       { status: 400 }
// // //     )
// // //   }
// // // }

// // // export async function PATCH(
// // //   req: Request,
// // //   { params }: { params: { orgId: string } }
// // // ) {
// // //   try {
// // //     const user = await getAuthenticatedUser()

// // //     if (!user) {
// // //       return NextResponse.json(
// // //         { error: "Unauthorized" },
// // //         { status: 401 }
// // //       )
// // //     }

// // //     const body = await req.json()
// // //     const validated = updateOrgSchema.parse(body)

// // //     const org = await updateOrg(user.id, params.orgId, validated.name)

// // //     return NextResponse.json(org)
// // //   } catch (error: any) {
// // //     return NextResponse.json(
// // //       { error: error.message },
// // //       { status: 400 }
// // //     )
// // //   }
// // // }

// // // export async function DELETE(
// // //   req: Request,
// // //   { params }: { params: { orgId: string } }
// // // ) {
// // //   try {
// // //     const user = await getAuthenticatedUser()

// // //     if (!user) {
// // //       return NextResponse.json(
// // //         { error: "Unauthorized" },
// // //         { status: 401 }
// // //       )
// // //     }

// // //     await deleteOrg(user.id, params.orgId)

// // //     return NextResponse.json(
// // //       { message: "Organization deleted successfully" },
// // //       { status: 200 }
// // //     )
// // //   } catch (error: any) {
// // //     return NextResponse.json(
// // //       { error: error.message },
// // //       { status: 400 }
// // //     )
// // //   }
// // // }


// // import { NextRequest, NextResponse } from "next/server";
// // import { getAuthenticatedUser } from "@/lib/auth";
// // import { deleteOrg, getOrgById, updateOrg } from "@/services/org.service";
// // import { updateOrgSchema } from "@/validations/org.schema";

// // export async function GET(
// //   request: NextRequest,
// //   context: { params: Promise<{ orgId: string }> }
// // ) {
// //   try {
// //     const { orgId } = await context.params;

// //     const user = await getAuthenticatedUser(request);

// //     if (!user) {
// //       return NextResponse.json(
// //         { error: "Unauthorized" },
// //         { status: 401 }
// //       );
// //     }

// //     const org = await getOrgById(user.id, orgId);

// //     if (!org) {
// //       return NextResponse.json(
// //         { error: "Organization not found" },
// //         { status: 404 }
// //       );
// //     }

// //     return NextResponse.json(org);
// //   } catch (error: any) {
// //     return NextResponse.json(
// //       { error: error.message ?? "Failed to fetch organization" },
// //       { status: 400 }
// //     );
// //   }
// // }

// // export async function PATCH(
// //   request: NextRequest,
// //   context: { params: Promise<{ orgId: string }> }
// // ) {
// //   try {
// //     const { orgId } = await context.params;

// //     const user = await getAuthenticatedUser(request);

// //     if (!user) {
// //       return NextResponse.json(
// //         { error: "Unauthorized" },
// //         { status: 401 }
// //       );
// //     }

// //     const body = await request.json();
// //     const validated = updateOrgSchema.parse(body);

// //     const org = await updateOrg(user.id, orgId, validated.name);

// //     return NextResponse.json(org);
// //   } catch (error: any) {
// //     return NextResponse.json(
// //       { error: error.message ?? "Failed to update organization" },
// //       { status: 400 }
// //     );
// //   }
// // }

// // export async function DELETE(
// //   request: NextRequest,
// //   context: { params: Promise<{ orgId: string }> }
// // ) {
// //   try {
// //     const { orgId } = await context.params;

// //     const user = await getAuthenticatedUser(request);

// //     if (!user) {
// //       return NextResponse.json(
// //         { error: "Unauthorized" },
// //         { status: 401 }
// //       );
// //     }

// //     await deleteOrg(user.id, orgId);

// //     return NextResponse.json(
// //       { message: "Organization deleted successfully" },
// //       { status: 200 }
// //     );
// //   } catch (error: any) {
// //     return NextResponse.json(
// //       { error: error.message ?? "Failed to delete organization" },
// //       { status: 400 }
// //     );
// //   }
// // }



// import { NextRequest, NextResponse } from "next/server";
// import { getAuthenticatedUser } from "@/lib/auth";
// import { deleteOrg, getOrgById, updateOrg } from "@/services/org.service";
// import { updateOrgSchema } from "@/validations/org.schema";

// // GET /api/org/[id]
// export async function GET(
//   request: NextRequest,
//   context: { params: { id: string } }
// ) {
//   try {
//     const { id } = context.params;

//     const user = await getAuthenticatedUser(request);

//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const org = await getOrgById(user.id, id);

//     if (!org) {
//       return NextResponse.json({ error: "Organization not found" }, { status: 404 });
//     }

//     return NextResponse.json(org);
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message ?? "Failed to fetch organization" }, { status: 400 });
//   }
// }

// // PATCH /api/org/[id]
// export async function PATCH(
//   request: NextRequest,
//   context: { params: { id: string } }
// ) {
//   try {
//     const { id } = context.params;

//     const user = await getAuthenticatedUser(request);

//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await request.json();
//     const validated = updateOrgSchema.parse(body);

//     const org = await updateOrg(user.id, id, validated.name);

//     return NextResponse.json(org);
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message ?? "Failed to update organization" }, { status: 400 });
//   }
// }

// // DELETE /api/org/[id]
// export async function DELETE(
//   request: NextRequest,
//   context: { params: { id: string } }
// ) {
//   try {
//     const { id } = context.params;

//     const user = await getAuthenticatedUser(request);

//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     await deleteOrg(user.id, id);

//     return NextResponse.json({ message: "Organization deleted successfully" }, { status: 200 });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message ?? "Failed to delete organization" }, { status: 400 });
//   }
// }



import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { deleteOrg, getOrgById, updateOrg } from "@/services/org.service";
import { updateOrgSchema } from "@/validations/org.schema";

// GET /api/org/[id]
export async function GET(
  request: NextRequest,
  context: { params: { id: string } } // plain object, NOT Promise
) {
  try {
    const { id } = context.params; // no await

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
  context: { params: { id: string } } // plain object
) {
  try {
    const { id } = context.params;

    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateOrgSchema.parse(body);

    const org = await updateOrg(user.id, id, validated.name);

    return NextResponse.json(org);
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Failed to update organization" }, { status: 400 });
  }
}

// DELETE /api/org/[id]
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } } // plain object
) {
  try {
    const { id } = context.params;

    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteOrg(user.id, id);

    return NextResponse.json({ message: "Organization deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Failed to delete organization" }, { status: 400 });
  }
}