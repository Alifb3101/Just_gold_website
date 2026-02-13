export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const resolveApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl && envUrl.trim().length > 0) return envUrl;
  if (import.meta.env.DEV) return '/api/v1';
  return 'http://localhost:5000/api/v1';
};

const resolveAssetBaseUrl = () => {
  const envUrl = import.meta.env.VITE_ASSET_URL as string | undefined;
  if (envUrl && envUrl.trim().length > 0) return envUrl;
  if (import.meta.env.DEV) return '';
  return 'http://localhost:5000';
};

export const API_BASE_URL = resolveApiBaseUrl();
export const ASSET_BASE_URL = resolveAssetBaseUrl();

type FetchJsonOptions = RequestInit & {
  timeoutMs?: number;
  retryCount?: number;
};

const buildApiUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;
  // Allow callers to hit the Vite proxy (and any same-origin API routes) directly.
  // Example: `/api/products` should not become `${API_BASE_URL}/api/products`.
  if (path === '/api' || path.startsWith('/api/')) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError';

const isNetworkError = (error: unknown) => error instanceof TypeError;

export async function fetchJson<T>(
  path: string,
  options: FetchJsonOptions = {}
): Promise<T> {
  const {
    timeoutMs = 10000,
    retryCount,
    headers,
    signal,
    method,
    ...rest
  } = options;

  const resolvedMethod = method?.toUpperCase() ?? 'GET';
  const maxRetries =
    typeof retryCount === 'number' ? retryCount : resolvedMethod === 'GET' ? 1 : 0;

  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    if (signal) {
      if (signal.aborted) {
        controller.abort();
      } else {
        signal.addEventListener('abort', () => controller.abort(), { once: true });
      }
    }

    const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(buildApiUrl(path), {
        ...rest,
        method: resolvedMethod,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...headers,
        },
      });

      const contentType = response.headers.get('content-type') ?? '';
      const isJson = contentType.includes('application/json');
      const body = isJson
        ? await response.json().catch(() => null)
        : await response.text();

      if (!response.ok) {
        const message =
          typeof body === 'object' && body && 'message' in body
            ? String((body as { message?: string }).message || '')
            : typeof body === 'string'
            ? body
            : '';
        throw new ApiError(
          message || response.statusText || `Request failed (${response.status}).`,
          response.status,
          typeof body === 'object' ? (body as { details?: unknown }).details : undefined
        );
      }

      if (body === null || body === '') {
        throw new ApiError('Empty response from API.', response.status);
      }

      return (body as T) ?? ({} as T);
    } catch (error) {
      if (!isAbortError(error) && isNetworkError(error) && attempt < maxRetries) {
        attempt += 1;
        continue;
      }
      throw error;
    } finally {
      globalThis.clearTimeout(timeoutId);
    }
  }
}
