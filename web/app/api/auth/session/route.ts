import { NextResponse } from "next/server";
import { getOptionalSession } from "@/lib/session";

export async function GET() {
  const session = await getOptionalSession();
  return NextResponse.json({ user: session?.user || null });
}
