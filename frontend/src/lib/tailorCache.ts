import type { TailorResult } from '../types/tailor'

const STORAGE_KEY = 'tailor:last-result'

interface TailorCacheEntry {
  resumeId: string
  jobDescription: string
  result: TailorResult
}

// Cache the last successful tailoring result in sessionStorage so an accidental refresh or
// back-navigation doesn't lose it and force a re-generate (which costs a real API call).
// sessionStorage rather than localStorage: it survives a refresh but clears when the tab
// closes, so it doesn't stockpile stale generations indefinitely. Every operation is wrapped
// in try/catch since storage access can throw (private browsing, disabled, quota) — caching
// is a nice-to-have, so failures are skipped silently rather than breaking the page.
export function saveTailorCache(entry: TailorCacheEntry) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entry))
  } catch {
    // ignore
  }
}

export function loadTailorCache(): TailorCacheEntry | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TailorCacheEntry) : null
  } catch {
    return null
  }
}

export function clearTailorCache() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
