import { describe, expect, test } from "bun:test";
import { readTapLocation, sameLocation } from "./tap-location-storage";

const approximate = { city: "Angeles City", country: "Philippines" };
describe("saved tap location", () => {
  test("missing or invalid storage requires a choice", () => {
    for (const value of [null, "broken", "{}", JSON.stringify({ source: "device" })]) {
      expect(readTapLocation(value)).toBeNull();
    }
  });
  test("persists both location sources with the visit's approximate reference", () => {
    for (const source of ["device", "approximate"] as const) {
      const saved = { source, location: { city: "Baliuag", country: "Philippines" }, approximate };
      expect(readTapLocation(JSON.stringify(saved))).toEqual(saved);
      expect(sameLocation(saved.approximate, approximate)).toBe(true);
      expect(sameLocation(saved.approximate, { ...approximate, city: "Manila" })).toBe(false);
    }
  });
  test("normalizes country codes and city case, but detects country changes", () => {
    expect(sameLocation(approximate, { city: " angeles city ", country: "PH" })).toBe(true);
    expect(sameLocation(approximate, { ...approximate, country: "United States" })).toBe(false);
  });
});
