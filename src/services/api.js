import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();
if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not defined');
}
const API_TIMEOUT_MS = 12000;

const unauthorizedListeners = new Set();

const authToken = () => {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = authToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      unauthorizedListeners.forEach((listener) => {
        try {
          listener();
        } catch {
          // no-op
        }
      });
    }
    return Promise.reject(error);
  }
);

export const registerUnauthorizedHandler = (handler) => {
  unauthorizedListeners.add(handler);
  return () => unauthorizedListeners.delete(handler);
};

export const toFriendlyErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error) return fallback;

  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please check your connection and try again.';
  }

  if (!error.response) {
    return 'Unable to reach server right now. Please try again.';
  }

  const status = Number(error.response?.status ?? 0);
  const rawMessage =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    '';
  const message = String(rawMessage).toLowerCase();

  if (status === 401) return 'Your session expired. Please sign in again.';
  if (status === 403) return 'You do not have permission for this action.';
  if (status === 404) return 'Requested resource was not found.';
  if (status === 409) return 'This request conflicts with current data. Please refresh and retry.';
  if (status === 422) return 'Please check your input and try again.';
  if (status >= 500) {
    if (rawMessage && String(rawMessage).trim().length > 0) {
      return String(rawMessage);
    }
    return 'Server error. Please try again in a moment.';
  }

  if (message.includes('out of stock')) return 'Some items are out of stock. Please review your cart.';
  if (message.includes('stripe') && !rawMessage) return 'Payment session could not be created. Please try again.';
  if (message.includes('unauthorized')) return 'Please sign in to continue.';

  return rawMessage || fallback;
};
