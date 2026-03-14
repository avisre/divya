import { NextResponse } from "next/server";
import { verifyCsrfRequest } from "../../../../lib/csrf";
import { loginUser } from "../../../../lib/data";
import { getSessionCookieOptions, SESSION_COOKIE } from "../../../../lib/session";

export async function POST(request: Request) {
  const csrfError = verifyCsrfRequest(request);
  if (csrfError) {
    return NextResponse.json({ message: csrfError }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const session = await loginUser(payload);
    const response = NextResponse.json({ user: session.user });
    response.cookies.set(SESSION_COOKIE, session.token, getSessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Web login failed", error);
    const message = error instanceof Error ? error.message : "Unable to sign in.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
