/**
 * Tiny typed localStorage wrapper. All persistence in the app goes through
 * here so keys stay namespaced and reads never throw (private mode, quota…).
 */
const PREFIX = 'hadiths40:'

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* ignore write failures (quota / disabled storage) */
  }
}

export const STORAGE_KEYS = {
  lang: 'lang',
  settings: 'settings',
  progress: 'progress',
  notes: 'notes',
  srs: 'srs',
  srsTimes: 'srsTimes',
  noteTimes: 'noteTimes',
} as const
