import { expect, test } from "bun:test";
import {
  hasRememberedLocationConsent,
  rememberedLocationConsentValue,
} from "./location-consent-storage";

const WEEK = 7 * 24 * 60 * 60 * 1000;

test("remembered consent remains valid for seven days", () => {
  const now = 10_000_000;
  expect(hasRememberedLocationConsent(rememberedLocationConsentValue(now), now + WEEK - 1)).toBe(true);
  expect(hasRememberedLocationConsent(rememberedLocationConsentValue(now), now + WEEK)).toBe(false);
});

test("invalid, missing, and future consent values are not remembered", () => {
  const now = 10_000_000;
  expect(hasRememberedLocationConsent(null, now)).toBe(false);
  expect(hasRememberedLocationConsent("1", now)).toBe(false);
  expect(hasRememberedLocationConsent(String(now + 1), now)).toBe(false);
});
