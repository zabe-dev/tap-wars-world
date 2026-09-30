const SHORT_WINDOW_MS = 10_000;
const LONG_WINDOW_MS = 60_000;
const MAX_SHORT_TAPS = 60;
const MAX_LONG_TAPS = 300;
const attempts = new Map<string, number[]>();

export type TapScore = { points: number; retryAfter: number };

/** Give each visitor a small burst, then ignore rapid spam for this window. */
export function scoreTap(key: string, now = Date.now()): TapScore {
  const recent = (attempts.get(key) ?? []).filter((timestamp) => now - timestamp < LONG_WINDOW_MS);
  const shortWindow = recent.filter((timestamp) => now - timestamp < SHORT_WINDOW_MS);
  if (shortWindow.length >= MAX_SHORT_TAPS) {
    attempts.set(key, recent);
    return { points: 0, retryAfter: Math.ceil((SHORT_WINDOW_MS - (now - shortWindow[0])) / 1000) };
  }
  if (recent.length >= MAX_LONG_TAPS) {
    attempts.set(key, recent);
    return { points: 0, retryAfter: Math.ceil((LONG_WINDOW_MS - (now - recent[0])) / 1000) };
  }
  if (recent.length === 0) attempts.delete(key);
  recent.push(now);
  attempts.set(key, recent);
  return { points: 1, retryAfter: 0 };
}

export function resetTapScores() { attempts.clear(); }
