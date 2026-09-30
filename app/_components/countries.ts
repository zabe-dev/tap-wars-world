import { countryCapital } from "../../country-capitals";

const regions = new Intl.DisplayNames(["en"], { type: "region" });
const LEADERBOARD_SIZE = 10;
const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 });

/** Select the visible leaderboard entries from an already sorted ranking. */
export function getTopCountries(ranking: [string, number][]) {
  return ranking.filter(([country]) => country !== "WW").slice(0, LEADERBOARD_SIZE);
}

/** Keep everyday counts precise while shortening values that would crowd the UI. */
export function formatCount(count: number) {
  return Math.abs(count) < 1_000 ? count.toLocaleString("en-US") : compactNumber.format(count);
}
const codesByName = new Map<string, string>();
for (let first = 65; first <= 90; first++) {
  for (let second = 65; second <= 90; second++) {
    const code = String.fromCharCode(first, second);
    const name = regions.of(code);
    if (name && name !== code) codesByName.set(name, code);
  }
}

export function countryCode(country: string) {
  if (/^[A-Z]{2}$/.test(country)) return country;
  return codesByName.get(country) ?? "WW";
}

export function countryName(country: string) {
  return country === "WW" ? "Location unknown" : regions.of(country) ?? country;
}

/** Show only usable city data, followed by the full country name. */
export function locationLabel(city: string, country: string) {
  if (country === "WW") return "Location unknown";
  const cleanCity = city.trim();
  const missing = ["", "unknown", "location unknown", "another location", "n/a", "na", "-"];
  const name = countryName(country);
  const displayCity = missing.includes(cleanCity.toLowerCase()) || cleanCity === name
    ? countryCapital(country) ?? ""
    : cleanCity;
  return displayCity ? `${displayCity}, ${name}` : name;
}

export function flag(country: string) {
  if (country === "WW") return "🌐";
  return String.fromCodePoint(...[...country].map((letter) => 127397 + letter.charCodeAt(0)));
}

export function toCounts(ranking: { country: string; count: number }[]) {
  return ranking.reduce<Record<string, number>>((counts, entry) => {
    const code = countryCode(entry.country);
    counts[code] = (counts[code] ?? 0) + entry.count;
    return counts;
  }, {});
}
