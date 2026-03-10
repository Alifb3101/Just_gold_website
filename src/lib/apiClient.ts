const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error ${response.status}: ${text}`);
  }

  return response.json();
}

/**
 * Derive the asset base URL from VITE_API_BASE_URL by stripping the API path prefix,
 * or use the explicit VITE_ASSET_URL env var if set.
 */
export const ASSET_BASE_URL: string = (() => {
  const envAssetUrl = import.meta.env.VITE_ASSET_URL as string | undefined;
  if (envAssetUrl && envAssetUrl.trim().length > 0) return envAssetUrl;
  try {
    const url = new URL(API_BASE_URL!);
    return `${url.protocol}//${url.host}`;
  } catch {
    return '';
  }
})();
