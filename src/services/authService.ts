import { fetchJson } from "@/app/api/http";

const AUTH_TIMEOUT = 10000;

export type LoginResponse = { token: string };
export type RegisterResponse = { id: number; email: string; role: string };

export async function login(email: string, password: string, signal?: AbortSignal): Promise<LoginResponse> {
  return fetchJson<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    signal,
    timeoutMs: AUTH_TIMEOUT,
  });
}

  export async function register(
    name: string,
    email: string,
    password: string,
    phone?: string,
    signal?: AbortSignal
  ): Promise<RegisterResponse> {
    return fetchJson<RegisterResponse>("/api/v1/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
      body: JSON.stringify({ name, email, password, phone }),
    signal,
    timeoutMs: AUTH_TIMEOUT,
  });
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` } as const;
}
