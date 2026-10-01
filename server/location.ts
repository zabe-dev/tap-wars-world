import { isIP } from "node:net";
import geoip from "geoip-lite";
import { z } from "zod";
import { countryCapital } from "../country-capitals";

const hopsSchema = z.coerce.number().int().min(0).max(10).default(0);
const locationSchema = z.object({
  country: z.string().regex(/^[A-Z]{2}$/),
  city: z.string().trim().max(200),
  region: z.string().trim().max(200).optional(),
});
const UNKNOWN = { country: "Worldwide", city: "Location unknown" };
const regions = new Intl.DisplayNames(["en"], { type: "region" });
const countryCodes = new Map<string, string>();
const PH_REGIONS: Record<string, string> = { "01": "Ilocos Region", "02": "Cagayan Valley", "03": "Central Luzon", "04": "Calabarzon", "05": "Bicol Region", "06": "Western Visayas", "07": "Central Visayas", "08": "Eastern Visayas", "09": "Zamboanga Peninsula", "10": "Northern Mindanao", "11": "Davao Region", "12": "Soccsksargen", "13": "Caraga", "14": "Cordillera Administrative Region", "15": "Bangsamoro" };
const US_REGIONS: Record<string, string> = { CA: "California", TX: "Texas", FL: "Florida", NY: "New York", PA: "Pennsylvania", IL: "Illinois", OH: "Ohio", GA: "Georgia", NC: "North Carolina", MI: "Michigan" };
for (let first = 65; first <= 90; first++) {
  for (let second = 65; second <= 90; second++) {
    const code = String.fromCharCode(first, second);
    const name = regions.of(code);
    if (name && name !== code) countryCodes.set(name.toLowerCase(), code);
  }
}

function hasUsableCity(city: string) {
  const normalized = city.trim().toLowerCase();
  return normalized.length > 0 && !["unknown", "n/a", "na", "-"].includes(normalized);
}

function normalizeRegion(country: string, region?: string, city?: string) {
	if (!region) return undefined;
	const value = region.trim();
	if (country === "PH" && value === "03" && city?.trim().toLowerCase() === "angeles city") return "Pampanga";
	return country === "PH" ? PH_REGIONS[value] ?? value : country === "US" ? US_REGIONS[value.toUpperCase()] ?? value : value;
}

function normalizeDeviceLocation(location?: { country: string; city: string; region?: string }) {
  if (!location) return null;
  const country = location.country.trim();
  const code = /^[A-Z]{2}$/.test(country) ? country : countryCodes.get(country.toLowerCase());
  const city = location.city.trim();
  if (!code || !regions.of(code)) return null;
  const resolvedCity = hasUsableCity(city) ? city : countryCapital(code);
  if (!resolvedCity) return null;
  return { country: regions.of(code) ?? country, city: resolvedCity, region: normalizeRegion(code, location.region, resolvedCity) };
}

/** Select the visitor from the right of a trusted proxy chain; zero disables headers. */
export function visitorIp(headers: Headers, hops: number): string | null {
  if (!Number.isInteger(hops) || hops < 1 || hops > 10) return null;
  const forwarded = headers.get("x-forwarded-for");
  if (!forwarded || forwarded.length > 2048) return null;
  const chain = forwarded.split(",").map((ip) => ip.trim());
  const candidate = chain[chain.length - hops];
  if (!candidate || !isIP(candidate)) return null;
  return candidate.replace(/^::ffff:(?=\d+\.)/i, "");
}

/** Resolve approximate location locally without sending visitor IPs to a service. */
export function getVisitorLocation(
  headers: Headers,
  hops = hopsSchema.parse(process.env.TRUSTED_PROXY_HOPS),
) {
  const ip = visitorIp(headers, hops);
  return lookupLocation(ip);
}

/** Look up a validated IP locally; caller-provided addresses are approximate, not identity proof. */
export function lookupLocation(ip: string | null) {
  if (ip && !isIP(ip)) return UNKNOWN;
  if (!ip) return UNKNOWN;
  try {
    const parsed = locationSchema.safeParse(geoip.lookup(ip));
    if (!parsed.success || regions.of(parsed.data.country) === parsed.data.country) return UNKNOWN;
    return {
      country: regions.of(parsed.data.country) ?? parsed.data.country,
      city: hasUsableCity(parsed.data.city) ? parsed.data.city : countryCapital(parsed.data.country) ?? "",
      region: normalizeRegion(parsed.data.country, parsed.data.region, parsed.data.city),
    };
  } catch {
    console.error("Local GeoIP lookup failed; counting tap without location.");
    return UNKNOWN;
  }
}

/** Use an explicitly approved device result, then fall back to public-IP lookup. */
export function resolveLocation(headers: Headers, browserIp?: string, deviceLocation?: { country: string; city: string; region?: string }): { country: string; city: string; region?: string } {
  const deviceResult = normalizeDeviceLocation(deviceLocation);
  if (deviceResult) return deviceResult;
  const location = getVisitorLocation(headers);
  if (location.country !== "Worldwide") return location;
  const browserLocation = lookupLocation(browserIp ?? null);
  return browserLocation.country !== "Worldwide" ? browserLocation : location;
}
