import { fetchJson } from "@/app/api/http";
import { authHeader } from "./authService";

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  addresses?: unknown;
  created_at?: string;
};

export async function fetchCurrentUser(token: string, signal?: AbortSignal): Promise<CurrentUser> {
  return fetchJson<CurrentUser>("/api/v1/users/me", {
    headers: {
      ...authHeader(token),
      "Content-Type": "application/json",
    },
    signal,
  });
}
