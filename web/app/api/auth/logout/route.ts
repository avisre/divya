import { NextResponse } from "next/server";
import { getSessionCookieOptions, SESSION_COOKIE } from "../../../../lib/session";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
    expires: new Date(0)
  });
  return response;
}
