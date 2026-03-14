import { NextResponse } from "next/server";
import { createCsrfToken, getCsrfTokenFromRequest, setCsrfCookie } from "../../../lib/csrf";

export async function GET(request: Request) {
  const token = getCsrfTokenFromRequest(request) || createCsrfToken();
  const response = NextResponse.json(
    { token },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );

  setCsrfCookie(response, token);
  return response;
}
