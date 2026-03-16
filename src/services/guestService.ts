/**
 * Guest Cart Session Management
 * Generates and maintains a unique guest ID for unauthenticated users
 * This ensures guest carts are properly tracked even without auth tokens
 */

const GUEST_ID_STORAGE_KEY = 'guest_cart_id';
const GUEST_ID_HEADER = 'X-Guest-Cart-Id';

/**
 * Generate a unique guest ID
 * Uses UUID v4 format for reliability
 */
export function generateGuestId(): string {
  return 'guest-' + crypto.getRandomValues(new Uint8Array(16))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 32);
}

/**
 * Get or create guest ID
 * Returns existing ID from localStorage or generates a new one
 */
export function getOrCreateGuestId(): string {
  try {
    // Check if guest ID exists
    const existing = localStorage.getItem(GUEST_ID_STORAGE_KEY);
    if (existing && existing.trim()) {
      console.debug('[guest] Using existing guest ID', { id: existing.substring(0, 10) + '...' });
      return existing;
    }

    // Generate new guest ID
    const newId = generateGuestId();
    localStorage.setItem(GUEST_ID_STORAGE_KEY, newId);
    console.debug('[guest] Generated new guest ID', { id: newId.substring(0, 10) + '...' });
    return newId;
  } catch (error) {
    console.warn('[guest] Failed to access localStorage, generating temporary ID', { error });
    // Fallback: generate temporary ID (will be lost on page reload)
    return generateGuestId();
  }
}

/**
 * Clear guest ID (when user logs in)
 */
export function clearGuestId(): void {
  try {
    localStorage.removeItem(GUEST_ID_STORAGE_KEY);
    console.debug('[guest] Cleared guest ID');
  } catch (error) {
    console.warn('[guest] Failed to clear guest ID', { error });
  }
}

/**
 * Get guest ID header for API requests
 * Returns header object or empty object if authenticated
 */
export function getGuestIdHeader(token?: string | null): Record<string, string> {
  // Don't send guest ID if user is authenticated
  if (token) {
    return {};
  }

  const guestId = getOrCreateGuestId();
  return { [GUEST_ID_HEADER]: guestId };
}
