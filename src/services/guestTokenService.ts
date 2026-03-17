/**
 * Guest Token Service
 * Manages persistent guest identification for non-authenticated users
 * Ensures the same guest token persists across sessions, reloads, and domain changes
 */

const GUEST_TOKEN_KEY = 'guest_token';

/**
 * Generate a proper UUIDv4 guest token
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * Backend expects UUID format in the database
 */
function generateGuestToken(): string {
  // Polyfill for crypto.getRandomValues if not available
  const getRandomValues = (arr: Uint8Array) => {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      return crypto.getRandomValues(arr);
    }
    // Fallback for older browsers
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  };

  const bytes = new Uint8Array(16);
  getRandomValues(bytes);

  // Set version to 4 (random)
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // Set variant to RFC 4122
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  // Convert bytes to UUID string format
  const hexString = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Format as xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  return `${hexString.substring(0, 8)}-${hexString.substring(8, 12)}-${hexString.substring(12, 16)}-${hexString.substring(16, 20)}-${hexString.substring(20, 32)}`;
}

/**
 * Check if token is in old format (guest_XXXXX)
 * Old format: guest_loKOG1NUzS68k2YUGOGLfqwUyMCUHUTM
 * New format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */
function isOldTokenFormat(token: string): boolean {
  return token && token.startsWith('guest_');
}

/**
 * Initialize guest token on app load
 * Returns existing token from localStorage or creates a new one
 * Automatically migrates old format tokens to new UUID format
 * This should be called ONCE on app initialization
 */
export function initializeGuestToken(): string {
  try {
    // Check if token already exists
    const existingToken = localStorage.getItem(GUEST_TOKEN_KEY);
    if (existingToken && existingToken.trim()) {
      // Migrate old format tokens to new UUID format
      if (isOldTokenFormat(existingToken)) {
        console.debug('[guest-token] Detected old token format, migrating to UUID...');
        localStorage.removeItem(GUEST_TOKEN_KEY);
        const newToken = generateGuestToken();
        localStorage.setItem(GUEST_TOKEN_KEY, newToken);
        console.debug('[guest-token] Migrated to new UUID token:', newToken);
        return newToken;
      }

      // Valid existing token
      console.debug('[guest-token] Found existing UUID token:', existingToken);
      return existingToken;
    }

    // Generate new UUID token
    const newToken = generateGuestToken();
    localStorage.setItem(GUEST_TOKEN_KEY, newToken);
    console.debug('[guest-token] Generated new UUID token:', newToken);
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
