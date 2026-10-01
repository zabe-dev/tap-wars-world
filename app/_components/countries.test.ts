import { expect, test } from "bun:test";
import { countryCode, countryName, flag, formatCount, getTopCountries, locationLabel, toCounts } from "./countries";

test("location labels show full countries without placeholder cities", () => {
  expect(locationLabel("Manila", "PH")).toBe("Manila, Philippines");
  for (const city of ["", "-", " N/A ", "Location unknown"]) {
    expect(locationLabel(city, "PH")).toBe("Manila, Philippines");
  }
  expect(locationLabel("", "WW")).toBe("Location unknown");
});

test("countries outside the former short list keep their name and code", () => {
  expect(countryCode("Sweden")).toBe("SE");
  expect(countryName("SE")).toBe("Sweden");
  expect(flag("SE")).toBe("🇸🇪");
});
test("normalizes UK aliases to the United Kingdom flag code", () => {
  expect(countryCode("UK")).toBe("GB");
  expect(countryCode("United Kingdom of Great Britain and Northern Ireland")).toBe("GB");
  expect(flag(countryCode("UK"))).toBe("🇬🇧");
});
test("unknown locations have a neutral label and globe", () => {
  expect(countryCode("Worldwide")).toBe("WW");
  expect(countryName("WW")).toBe("Location unknown");
  expect(flag("WW")).toBe("🌐");
});
test("formats large counts compactly without changing small counts", () => {
  expect(formatCount(999)).toBe("999");
  expect(formatCount(1_250)).toBe("1.25K");
  expect(formatCount(1_250_000)).toBe("1.25M");
});
test("merges country names and codes without losing counts", () => {
  expect(toCounts([{ country: "United States", count: 3 }, { country: "US", count: 2 }])).toEqual({ US: 5 });
});

test("leaderboard selects the top ten countries, excluding unknown", () => {
  const ranking: [string, number][] = ["WW", "PH", "JP", "US", "BR", "AU", "DE", "CA", "SG", "KR", "IN", "MX"]
    .map((country, index) => [country, 100 - index]);
  const top = getTopCountries(ranking);
  expect(top).toHaveLength(10);
  expect(top.map(([country]) => country)).toEqual(["PH", "JP", "US", "BR", "AU", "DE", "CA", "SG", "KR", "IN"]);
  const updated: [string, number][] = [["MX", 200], ...ranking.filter(([country]) => country !== "MX")];
  expect(getTopCountries(updated).some(([country]) => country === "IN")).toBe(false);
  expect(getTopCountries(updated)[0][0]).toBe("MX");
});

test("no ranked countries means an empty leaderboard", () => {
  expect(getTopCountries([])).toEqual([]);
  expect(getTopCountries([["WW", 10]])).toEqual([]);
});
