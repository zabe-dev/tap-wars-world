import { isIP } from "node:net";
import geoip from "geoip-lite";
import { z } from "zod";

const hopsSchema = z.coerce.number().int().min(0).max(10).default(0);
const locationSchema = z.object({
  country: z.string().regex(/^[A-Z]{2}$/),
  city: z.string().trim().max(200),
});
const UNKNOWN = { country: "Worldwide", city: "Location unknown" };
const regions = new Intl.DisplayNames(["en"], { type: "region" });

function hasUsableCity(city: string) {
  const normalized = city.trim().toLowerCase();
  return normalized.length > 0 && !["unknown", "n/a", "na", "-"].includes(normalized);
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
