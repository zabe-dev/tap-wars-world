import { z } from "zod";
import { countryCode } from "./countries";

export const TAP_LOCATION_KEY = "wc-tap-location";
const placeSchema = z.object({ city: z.string().trim().min(1).max(200), country: z.string().trim().min(1).max(200) });
const savedSchema = z.object({ source: z.enum(["device", "approximate"]), location: placeSchema, approximate: placeSchema });
export type SavedTapLocation = z.infer<typeof savedSchema>;

export function readTapLocation(value: string | null): SavedTapLocation | null {
  try {
    const parsed = savedSchema.safeParse(JSON.parse(value ?? "null"));
    return parsed.success ? parsed.data : null;
  } catch { return null; }
}

export function sameLocation(left: SavedTapLocation["location"], right: SavedTapLocation["location"]) {
  return countryCode(left.country) === countryCode(right.country)
    && left.city.trim().toLowerCase() === right.city.trim().toLowerCase();
}
