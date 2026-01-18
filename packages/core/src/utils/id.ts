/**
 * Simple ID generation utility
 */

let counter = 0;

/**
 * Generates a unique ID
 * In production, you might use UUID or nanoid
 */
export function generateId(): string {
  return `${Date.now()}-${++counter}`;
}

/**
 * Resets the counter (useful for testing)
 */
export function resetIdCounter(): void {
  counter = 0;
}
