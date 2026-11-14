import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("chooseu_admin_session")?.value;
    const session = verifyAdminSessionToken(cookieToken);

    if (!session) {
      return NextResponse.json(
        { authenticated: false, role: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      role: session.role,
      expiresAt: session.expiresAt,
    });
  } catch {
    return NextResponse.json(
      { authenticated: false, role: null },
      { status: 500 }
    );
  }
}
