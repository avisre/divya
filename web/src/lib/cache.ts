export function readCachedJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeCachedJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

