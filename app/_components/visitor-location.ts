import { z } from "zod";

const locationSchema = z.object({ country: z.string(), city: z.string() });
const ipSchema = z.object({ ip: z.union([z.ipv4(), z.ipv6()]) });
type VisitorLocation = { country: string; city: string; ip?: string };
const UNKNOWN: VisitorLocation = { country: "Worldwide", city: "Location unknown" };

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
      if (location.country !== "Worldwide" && location.city.trim()) return location;
    }
    // The browser contacts ipify directly so it returns the visitor's IP, not the server's.
    const discovery = await request("https://api64.ipify.org?format=json", { signal: AbortSignal.timeout(4000), credentials: "omit" });
    if (!discovery.ok) return UNKNOWN;
    const { ip } = ipSchema.parse(await discovery.json());
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
