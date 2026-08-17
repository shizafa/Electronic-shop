// Reads and parses a JSON value from localStorage; returns fallback if missing, on the server, or invalid
export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback; // no localStorage during server-side rendering
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback; // corrupted/invalid JSON, don't crash the app
  }
}

// Serializes a value to JSON and saves it to localStorage (no-op on the server)
export function writeJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}