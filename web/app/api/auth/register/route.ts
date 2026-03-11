import { NextResponse } from "next/server";
import { registerUser } from "@/lib/data";
import { setSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const session = await registerUser(payload);
    await setSessionCookie(session.token);
    return NextResponse.json({ user: session.user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create account.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
