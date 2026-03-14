import { NextResponse } from "next/server";
import { verifyCsrfRequest } from "../../../../lib/csrf";
import { registerUser } from "../../../../lib/data";
import { getSessionCookieOptions, SESSION_COOKIE } from "../../../../lib/session";

export async function POST(request: Request) {
  const csrfError = verifyCsrfRequest(request);
  if (csrfError) {
    return NextResponse.json({ message: csrfError }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const session = await registerUser(payload);
    const response = NextResponse.json({ user: session.user });
    response.cookies.set(SESSION_COOKIE, session.token, getSessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Web registration failed", error);
    const message = error instanceof Error ? error.message : "Unable to create account.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
