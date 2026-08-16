import { ROLE_PERMISSIONS, type User } from "../types/auth";

// Exported so tests can put a deliberately broken value in storage.
export const STORAGE_KEY = "access-portal-user";

// Only accepts something that really looks like a user, so a corrupted or
// hand-edited entry is treated as nobody being signed in rather than crashing.
function isUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<User>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.role === "string" &&
    candidate.role in ROLE_PERMISSIONS
  );
}

// Reads back a user saved earlier in this tab. Returns null if there is none,
// if it is unreadable, or if the browser refuses to give us storage at all.
export function readStoredUser(): User | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    return isUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function storeUser(user: User): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Storage can be full or switched off. Staying signed in is a convenience,
    // so losing it is not worth breaking the sign-in over.
  }
}

export function clearStoredUser(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Same reasoning as above.
  }
}
