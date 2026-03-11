import { NextResponse } from "next/server";
import { fetchBackendResponse } from "../../../../lib/backend";
import { getAuthToken } from "../../../../lib/session";

async function proxy(request: Request, params: { path: string[] }) {
  const token = await getAuthToken();
  const url = new URL(request.url);
  const backendPath = `/${params.path.join("/")}${url.search}`;
  const body =
    request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();

  const response = await fetchBackendResponse(backendPath, {
    method: request.method,
    token,
    headers: {
      "Content-Type": request.headers.get("Content-Type") || "application/json",
      "x-idempotency-key": request.headers.get("x-idempotency-key") || ""
    },
    body
  });

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "application/json"
    }
  });
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await context.params);
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await context.params);
}

export async function PUT(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await context.params);
}

export async function DELETE(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await context.params);
}
