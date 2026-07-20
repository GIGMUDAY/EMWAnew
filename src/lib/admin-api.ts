const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

export type AdminRole = "ADMIN" | "SUPER_ADMIN";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function adminApi<T>(
  path: string,
  token?: string,
  init: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData))
    headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const payload = response.status === 204 ? { success: true, data: null } : await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.error?.message ?? payload?.message ?? "Request failed",
    );
  }
  return payload;
}

export const loginAdmin = (email: string, password: string) =>
  adminApi<{
    admin: { id: string; fullName: string; email?: string; role: AdminRole };
    accessToken: string;
    refreshToken: string;
  }>("/auth/login", undefined, { method: "POST", body: JSON.stringify({ email, password }) });

export const loginDemoAdmin = () =>
  adminApi<{
    admin: { id: string; fullName: string; email?: string; role: AdminRole };
    accessToken: string;
    refreshToken: string;
  }>("/auth/demo-login", undefined, { method: "POST" });

export const listData = async <T>(path: string, token: string) => {
  const result = await adminApi<T[]>(path, token);
  return { rows: result.data, total: result.meta?.total ?? result.data.length };
};

export { API_BASE };
