import { z } from "zod";

const locationSchema = z.object({ country: z.string().trim().min(1).max(200), city: z.string().trim().max(200) });
const ipSchema = z.object({ ip: z.union([z.ipv4(), z.ipv6()]) });
type VisitorLocation = z.infer<typeof locationSchema> & { ip?: string };
const UNKNOWN: VisitorLocation = { country: "Worldwide", city: "Location unknown" };

const LOCATION_TTL = 5 * 60_000;
const FAILURE_TTL = 30_000;
const REQUEST_TIMEOUT = 3000;

/** Coalesce lookups, refresh expired results, and back off after failure. */
export function createLocationResolver(request: typeof fetch = fetch, now = Date.now) {
  let pending: Promise<VisitorLocation> | undefined;
  let cached: VisitorLocation | undefined;
  let expiresAt = 0;
  return () => {
    if (pending) return pending;
    if (cached && now() < expiresAt) return Promise.resolve(cached);
    pending = discoverLocation(request).then((location) => {
      cached = location;
      expiresAt = now() + (location.country === "Worldwide" ? FAILURE_TTL : LOCATION_TTL);
      return location;
    }).finally(() => { pending = undefined; });
    return pending;
  };
}

async function requestLocation(request: typeof fetch, ip?: string): Promise<VisitorLocation> {
  try {
    const response = await request("/api/location", {
      cache: "no-store", signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      ...(ip ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ip }) } : {}),
    });
    if (!response.ok) return UNKNOWN;
    return { ...locationSchema.parse(await response.json()), ...(ip ? { ip } : {}) };
  } catch {
    // Keep taps and public-IP fallback available after a failed server lookup.
    return UNKNOWN;
  }
}

async function discoverLocation(request: typeof fetch): Promise<VisitorLocation> {
  const location = await requestLocation(request);
  if (location.country !== "Worldwide") return location;
  // Another public IP cannot guarantee a city; discover only when country is missing.
  try {
    const response = await request("https://api64.ipify.org?format=json", {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT), credentials: "omit", cache: "no-store",
    });
    if (!response.ok) return location;
    const { ip } = ipSchema.parse(await response.json());
    return await requestLocation(request, ip);
  } catch {
    return location;
  }
}

export const getVisitorLocation = createLocationResolver();
