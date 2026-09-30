import { z } from "zod";

const placeSchema = z.object({
  countryCode: z.string().regex(/^[A-Z]{2}$/),
  city: z.string().trim().max(200).optional(),
  locality: z.string().trim().max(200).optional(),
});
const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
const regions = new Intl.DisplayNames(["en"], { type: "region" });
const TIMEOUT = 8000;
const COOLDOWN = 30_000;

export type DeviceLocation = { city: string; country: string };

/** Resolve only the device's current coordinates, directly from its browser. */
export async function resolveDeviceLocation(geolocation: Geolocation, request: typeof fetch = fetch): Promise<DeviceLocation> {
  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    geolocation.getCurrentPosition(resolve, () => reject(new Error("Location permission denied or unavailable. You can keep using approximate location.")), {
      enableHighAccuracy: false, maximumAge: 0, timeout: TIMEOUT,
    });
  });
  const coordinates = coordinatesSchema.parse(position.coords);
  const query = new URLSearchParams({
    latitude: String(coordinates.latitude), longitude: String(coordinates.longitude), localityLanguage: "en",
  });
  const response = await request(`https://api.bigdatacloud.net/data/reverse-geocode-client?${query}`, {
    credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer", signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!response.ok) throw new Error("City lookup is unavailable. Please try again later.");
  const parsed = placeSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("City lookup returned an invalid location. Please try again later.");
  const place = parsed.data;
  const country = regions.of(place.countryCode);
  const city = place.city || place.locality;
  if (!country || country === place.countryCode || !city) throw new Error("No city was found for this location.");
  return { city, country };
}

/** Limit explicit device lookups to one attempt per 30 seconds; never auto-retry. */
export function createDeviceLocationResolver(now = Date.now) {
  let retryAt = 0;
  return (geolocation: Geolocation, request: typeof fetch = fetch) => {
    if (now() < retryAt) return Promise.reject(new Error("Please wait 30 seconds before trying again."));
    retryAt = now() + COOLDOWN;
    return resolveDeviceLocation(geolocation, request);
  };
}

export const getDeviceLocation = createDeviceLocationResolver();
