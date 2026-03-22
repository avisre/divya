import { ALLOW_LOCAL_BACKEND_FALLBACK, BACKEND_API_BASE_URL } from "./env";
import { handleLocalBackendRequest, isLocalBackendToken } from "./local-backend";
import type { ApiErrorPayload } from "./types";

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

const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);
const MAX_BACKEND_READ_ATTEMPTS = 2;
const BACKEND_READ_TIMEOUT_MS = 3000;
const BACKEND_WRITE_TIMEOUT_MS = 10000;

function normalizeBackendPath(path: string) {
  const trimmed = path.trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

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
  const normalizedPath = normalizeBackendPath(path);
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }
  const method = String(options.method || "GET").toUpperCase();
  const maxAttempts = method === "GET" || method === "HEAD" ? MAX_BACKEND_READ_ATTEMPTS : 1;
  const timeoutMs =
    method === "GET" || method === "HEAD" ? BACKEND_READ_TIMEOUT_MS : BACKEND_WRITE_TIMEOUT_MS;

  if (isLocalBackendToken(options.token)) {
    const localResponse = await handleLocalBackendRequest(normalizedPath, {
      ...options,
      method,
      headers
    });
    if (localResponse) {
      return localResponse;
    }
  }

  let lastError: unknown = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(new Error("Backend request timed out.")), timeoutMs);
      const abortProvidedSignal = options.signal;
      const abortFromCaller = () => controller.abort(abortProvidedSignal?.reason);
      abortProvidedSignal?.addEventListener("abort", abortFromCaller, { once: true });

      let response: Response;
      try {
        response = await fetch(`${BACKEND_API_BASE_URL.trim()}${normalizedPath}`, {
          ...options,
          method,
          headers,
          cache: options.cache || "no-store",
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeout);
        abortProvidedSignal?.removeEventListener("abort", abortFromCaller);
      }

      const retryDelayMs =
        attempt < maxAttempts - 1 ? await getRetryDelayMs(response, attempt) : null;

      if (retryDelayMs === null) {
        return response;
      }

      await sleep(retryDelayMs);
    } catch (error) {
      lastError = error;

      if (ALLOW_LOCAL_BACKEND_FALLBACK) {
        const localResponse = await handleLocalBackendRequest(normalizedPath, {
          ...options,
          method,
          headers
        });
        if (localResponse) {
          return localResponse;
        }
      }

      if (attempt >= maxAttempts - 1) {
        throw error;
      }

      await sleep(getFallbackRetryDelayMs(attempt));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unable to reach backend.");
}

async function readJsonSafe<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function sleep(durationMs: number) {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}

function getFallbackRetryDelayMs(attempt: number) {
  return Math.min(3000, 400 * 2 ** attempt);
}

async function getRetryDelayMs(response: Response, attempt: number) {
  if (!RETRYABLE_STATUS_CODES.has(response.status)) {
    return null;
  }

  const retryAfterHeader = response.headers.get("retry-after");
  if (retryAfterHeader) {
    const retryAfterSeconds = Number(retryAfterHeader);
    if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
      return Math.min(5000, retryAfterSeconds * 1000);
    }
  }

  const payload = await readJsonSafe<ApiErrorPayload & { details?: { retryAfterMs?: number } }>(
    response.clone()
  );
  const retryAfterMs = Number(payload?.details?.retryAfterMs);
  if (Number.isFinite(retryAfterMs) && retryAfterMs > 0) {
    return Math.min(5000, retryAfterMs);
  }

  return getFallbackRetryDelayMs(attempt);
}
