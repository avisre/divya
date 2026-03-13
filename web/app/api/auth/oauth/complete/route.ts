import { NextResponse } from "next/server";
import { fetchBackend } from "../../../../../lib/backend";
import { getSessionCookieOptions, SESSION_COOKIE } from "../../../../../lib/session";
import type { UserSession } from "../../../../../lib/types";

export async function POST(request: Request) {
  try {
    const { token, next } = (await request.json()) as { token?: string; next?: string };
    if (!token) {
      return NextResponse.json({ message: "OAuth token missing." }, { status: 400 });
    }
    const { user } = await fetchBackend<{ user: UserSession }>("/auth/me", { token });
    const response = NextResponse.json({ user, next: next || "/home" });
    response.cookies.set(SESSION_COOKIE, token, getSessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Web OAuth completion failed", error);
    const message = error instanceof Error ? error.message : "OAuth callback failed.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
