import { NextResponse } from "next/server";
import { verifyCsrfRequest } from "../../../../lib/csrf";
import { requestPasswordReset } from "../../../../lib/data";

export async function POST(request: Request) {
  const csrfError = verifyCsrfRequest(request);
  if (csrfError) {
    return NextResponse.json({ message: csrfError }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const result = await requestPasswordReset(payload);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send reset link.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

