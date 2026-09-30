/** Store only the UTC calendar day on which the location prompt was answered. */
export function locationConsentDay(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

/** Schedule the next prompt at midnight UTC, independent of the device timezone. */
export function millisecondsUntilUtcMidnight(now = new Date()) {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1) - now.getTime();
}
