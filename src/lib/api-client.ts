import { auth } from "@/src/lib/firebase";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string | null,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isSubscriptionRequired() {
    return this.status === 403 && this.code === "subscription_required";
  }
}

async function getToken(): Promise<string | null> {
  if (!auth.currentUser) return null;
  return auth.currentUser.getIdToken();
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { cache: "no-store", ...init, headers });

  if (!res.ok) {
    let code: string | null = null;
    try {
      const body = await res.json() as { code?: string; detail?: { code?: string } | string };
      // FastAPI wraps error details in `detail`
      if (typeof body.detail === "object" && body.detail !== null) {
        code = body.detail.code ?? null;
      } else {
        code = body.code ?? null;
      }
    } catch {
      // non-JSON error body
    }
    throw new ApiError(res.status, code, `HTTP ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown = {}) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
