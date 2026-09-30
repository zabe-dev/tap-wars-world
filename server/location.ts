import { isIP } from "node:net";
import { existsSync } from "node:fs";
import geoip from "geoip-lite";
import { IP2Location } from "ip2location-nodejs";
import { z } from "zod";

const hopsSchema = z.coerce.number().int().min(0).max(10).default(0);
const locationSchema = z.object({
  country: z.string().regex(/^[A-Z]{2}$/),
  city: z.string().trim().max(200),
});
const UNKNOWN = { country: "Worldwide", city: "Location unknown" };
const regions = new Intl.DisplayNames(["en"], { type: "region" });
const ip2LocationPath = process.env.IP2LOCATION_DATABASE_PATH?.trim();
let ip2Location: IP2Location | null | undefined;

function hasUsableCity(city: string) {
  const normalized = city.trim().toLowerCase();
  return normalized.length > 0 && !["unknown", "n/a", "na", "-"].includes(normalized);
}

function getIp2LocationDatabase() {
  if (ip2Location !== undefined) return ip2Location;
  if (!ip2LocationPath || !existsSync(ip2LocationPath)) {
    ip2Location = null;
    return ip2Location;
  }
  try {
    const database = new IP2Location();
    database.open(ip2LocationPath);
    ip2Location = database;
  } catch (error) {
    console.error("IP2Location database could not be opened; using fallback database.", error);
    ip2Location = null;
  }
  return ip2Location;
}

function lookupWithIp2Location(ip: string) {
  const database = getIp2LocationDatabase();
  if (!database) return null;
  try {
    const result = database.getAll(ip);
    const country = result.countryShort?.trim().toUpperCase();
    const city = result.city?.trim();
    if (!country || !/^[A-Z]{2}$/.test(country) || !city || !hasUsableCity(city)) return null;
    return { country: regions.of(country) ?? country, city };
  } catch {
    return null;
  }
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
    const ip2LocationResult = lookupWithIp2Location(ip);
    if (ip2LocationResult) return ip2LocationResult;
    const parsed = locationSchema.safeParse(geoip.lookup(ip));
    if (!parsed.success) return UNKNOWN;
    return {
      country: regions.of(parsed.data.country) ?? parsed.data.country,
      city: parsed.data.city,
    };
  } catch {
    console.error("Local GeoIP lookup failed; counting tap without location.");
    return UNKNOWN;
  }
}

/** Prefer the trusted proxy, falling back to the browser's public-IP discovery. */
export function resolveLocation(headers: Headers, browserIp?: string) {
  const location = getVisitorLocation(headers);
  if (location.country !== "Worldwide" && hasUsableCity(location.city)) return location;
  const browserLocation = lookupLocation(browserIp ?? null);
  return browserLocation.country !== "Worldwide" ? browserLocation : location;
}
