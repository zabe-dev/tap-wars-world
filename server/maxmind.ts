import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Reader } from "@maxmind/geoip2-node";

let reader: ReturnType<typeof Reader.openBuffer> | null = null;
let attempted = false;

function getReader() {
	if (attempted) return reader;
	attempted = true;
	const path = process.env.GEOIP_DATABASE_PATH ?? join(process.cwd(), "data", "GeoLite2-City.mmdb");
	if (!existsSync(path)) return null;
	try { reader = Reader.openBuffer(readFileSync(path)); } catch { reader = null; }
	return reader;
}

export function lookupMaxMind(ip: string) {
	const database = getReader();
	if (!database) return null;
	try {
		const result = database.city(ip);
		return {
			country: result.country?.isoCode,
			city: result.city?.names?.en,
			region: result.subdivisions?.[0]?.names?.en,
		};
	} catch { return null; }
}
