import { NextResponse } from "next/server";
import { registerUser } from "../../../../lib/data";
import { getSessionCookieOptions, SESSION_COOKIE } from "../../../../lib/session";

export async function POST(request: Request) {
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
