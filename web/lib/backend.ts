import { BACKEND_API_BASE_URL } from "@/lib/env";
import type { ApiErrorPayload } from "@/lib/types";

export class BackendError extends Error {
  status: number;
  payload: ApiErrorPayload | null;

  constructor(message: string, status: number, payload: ApiErrorPayload | null = null) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

type BackendOptions = RequestInit & {
  token?: string | null;
};

export async function fetchBackend<T>(path: string, options: BackendOptions = {}): Promise<T> {
  const response = await fetchBackendResponse(path, options);

  if (!response.ok) {
    const payload = await readJsonSafe<ApiErrorPayload>(response);
    throw new BackendError(payload?.message || response.statusText, response.status, payload);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function fetchBackendResponse(path: string, options: BackendOptions = {}) {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  return fetch(`${BACKEND_API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: options.cache || "no-store"
  });
}

async function readJsonSafe<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}
