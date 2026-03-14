import { NextResponse } from "next/server";
import { verifyCsrfRequest } from "../../../../lib/csrf";
import { getSessionCookieOptions, SESSION_COOKIE } from "../../../../lib/session";

export async function POST(request: Request) {
  const csrfError = verifyCsrfRequest(request);
  if (csrfError) {
    return NextResponse.json({ message: csrfError }, { status: 403 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
    expires: new Date(0)
  });
  return response;
}
