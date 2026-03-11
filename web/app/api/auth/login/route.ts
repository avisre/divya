import { NextResponse } from "next/server";
import { loginUser } from "@/lib/data";
import { setSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const session = await loginUser(payload);
    await setSessionCookie(session.token);
    return NextResponse.json({ user: session.user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign in.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
