import { z } from "zod";

const locationSchema = z.object({ country: z.string(), city: z.string() });
const ipSchema = z.object({ ip: z.union([z.ipv4(), z.ipv6()]) });
type VisitorLocation = { country: string; city: string; ip?: string };
const UNKNOWN: VisitorLocation = { country: "Worldwide", city: "Location unknown" };

function hasUsableCity(location: VisitorLocation) {
	return location.city.trim().length > 0 && !["unknown", "n/a", "na", "-"].includes(location.city.trim().toLowerCase());
}

/** One shared lookup per page session, including concurrent tap requests. */
export function createLocationResolver(request: typeof fetch = fetch) {
  let pending: Promise<VisitorLocation> | undefined;
  return () => pending ??= discoverLocation(request);
}

async function discoverLocation(request: typeof fetch): Promise<VisitorLocation> {
  try {
    const response = await request("/api/location", { signal: AbortSignal.timeout(3000) });
    if (response.ok) {
      const location = locationSchema.parse(await response.json());
      if (location.country !== "Worldwide" && hasUsableCity(location)) return location;
    }
    // The browser contacts ipify directly so it returns the visitor's IP, not the server's.
    let ip: string | null = null;
    for (const endpoint of ["https://api64.ipify.org?format=json", "https://api.ipify.org?format=json"]) {
      try {
        const discovery = await request(endpoint, { signal: AbortSignal.timeout(4000), credentials: "omit", cache: "no-store" });
        if (discovery.ok) { ip = ipSchema.parse(await discovery.json()).ip; break; }
      } catch {
        /* Try the alternate public-IP endpoint. */
      }
    }
    if (!ip) return UNKNOWN;
    const located = await request("/api/location", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip }), signal: AbortSignal.timeout(3000),
    });
    if (!located.ok) return UNKNOWN;
    return { ...locationSchema.parse(await located.json()), ip };
  } catch {
    // Location is optional: taps continue without attribution when discovery fails.
    return UNKNOWN;
  }
}

export const getVisitorLocation = createLocationResolver();
