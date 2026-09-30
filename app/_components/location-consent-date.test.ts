import { expect, test } from "bun:test";
import { locationConsentDay, millisecondsUntilUtcMidnight } from "./location-consent-date";

test("consent day changes at UTC midnight, not local midnight", () => {
  expect(locationConsentDay(new Date("2026-10-01T07:59:59+08:00"))).toBe("2026-09-30");
  expect(locationConsentDay(new Date("2026-10-01T08:00:00+08:00"))).toBe("2026-10-01");
});

test("midnight scheduling handles day, month, year, and leap-day boundaries", () => {
  for (const date of ["2026-09-30", "2026-12-31", "2028-02-29"]) {
    expect(millisecondsUntilUtcMidnight(new Date(`${date}T23:59:59.999Z`))).toBe(1);
    expect(millisecondsUntilUtcMidnight(new Date(`${date}T00:00:00Z`))).toBe(86_400_000);
  }
});
