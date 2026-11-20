import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/server-auth";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("chooseu_admin_session")?.value;
    const session = verifyAdminSessionToken(cookieToken);

    if (!session) {
      return NextResponse.json(
        { authenticated: false, role: null },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        role: session.role,
        expiresAt: session.expiresAt,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { authenticated: false, role: null },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}