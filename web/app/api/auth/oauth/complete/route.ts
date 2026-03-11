import { NextResponse } from "next/server";
import { fetchBackend } from "@/lib/backend";
import { setSessionCookie } from "@/lib/session";
import type { UserSession } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { token, next } = (await request.json()) as { token?: string; next?: string };
    if (!token) {
      return NextResponse.json({ message: "OAuth token missing." }, { status: 400 });
    }
    const { user } = await fetchBackend<{ user: UserSession }>("/auth/me", { token });
    await setSessionCookie(token);
    return NextResponse.json({ user, next: next || "/home" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth callback failed.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
