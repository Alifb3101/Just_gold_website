import { fetchJson } from "@/app/api/http";
import { authHeader } from "./authService";

export type Address = {
  id: number;
  label?: string | null;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  is_default?: boolean;
};

export type CreateAddressInput = {
  label?: string;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
};

const BASE = "/api/v1/addresses";

export async function listAddresses(token: string, signal?: AbortSignal): Promise<Address[]> {
  return fetchJson<Address[]>(BASE, {
    headers: {
      ...authHeader(token),
      "Content-Type": "application/json",
    },
    signal,
  });
}

export async function createAddress(token: string, payload: CreateAddressInput, signal?: AbortSignal): Promise<Address> {
  return fetchJson<Address>(BASE, {
    method: "POST",
    headers: {
      ...authHeader(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal,
  });
}

export async function setDefaultAddress(token: string, id: number, signal?: AbortSignal): Promise<Address> {
  return fetchJson<Address>(`${BASE}/${id}/default`, {
    method: "POST",
    headers: {
      ...authHeader(token),
      "Content-Type": "application/json",
    },
    signal,
  });
}

export async function deleteAddress(token: string, id: number, signal?: AbortSignal): Promise<{ success: boolean }> {
  return fetchJson<{ success: boolean }>(`${BASE}/${id}`, {
    method: "DELETE",
    headers: {
      ...authHeader(token),
      "Content-Type": "application/json",
    },
    signal,
  });
}
