/**
 * Guest Token Service
 * Manages persistent guest identification for non-authenticated users
 * Ensures the same guest token persists across sessions, reloads, and domain changes
 */

const GUEST_TOKEN_KEY = 'guest_token';

/**
 * Generate a UUIDv4-like guest token
 * Format: guest_XXXXXXXXXXXXXXXX
 */
function generateGuestToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'guest_';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Initialize guest token on app load
 * Returns existing token from localStorage or creates a new one
 * This should be called ONCE on app initialization
 */
export function initializeGuestToken(): string {
  try {
    // Check if token already exists
    const existingToken = localStorage.getItem(GUEST_TOKEN_KEY);
    if (existingToken && existingToken.trim()) {
      console.debug('[guest-token] Found existing token:', existingToken.substring(0, 20) + '...');
      return existingToken;
    }

    // Generate new token
    const newToken = generateGuestToken();
    localStorage.setItem(GUEST_TOKEN_KEY, newToken);
    console.debug('[guest-token] Generated new token:', newToken.substring(0, 20) + '...');
    return newToken;
  } catch (error) {
    console.error('[guest-token] localStorage error, generating temporary token:', error);
    // Fallback: return temporary token (will be regenerated on reload)
    return generateGuestToken();
  }
}

/**
 * Get the current guest token from localStorage
 * Should already exist from initialization
 */
export function getGuestToken(): string | null {
  try {
    const token = localStorage.getItem(GUEST_TOKEN_KEY);
    return token && token.trim() ? token : null;
  } catch (error) {
    console.error('[guest-token] Failed to get token:', error);
    return null;
  }
}

/**
 * Clear guest token (only when user logs in or explicitly resets)
 */
export function clearGuestToken(): void {
  try {
    localStorage.removeItem(GUEST_TOKEN_KEY);
    console.debug('[guest-token] Token cleared');
  } catch (error) {
    console.error('[guest-token] Failed to clear token:', error);
  }
}

/**
 * Check if a guest token exists
 */
export function hasGuestToken(): boolean {
  return getGuestToken() !== null;
}
