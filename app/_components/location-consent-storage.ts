const REMEMBER_DURATION = 7 * 24 * 60 * 60 * 1000;

export function hasRememberedLocationConsent(value: string | null, now = Date.now()) {
  if (value === null || value === "1") return false;
  const savedAt = Number(value);
  return Number.isFinite(savedAt)
    && savedAt > 0
    && now >= savedAt
    && now - savedAt < REMEMBER_DURATION;
}

export function rememberedLocationConsentValue(now = Date.now()) {
  return String(now);
}
