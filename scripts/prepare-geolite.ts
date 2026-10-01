import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const target = join(process.cwd(), "data", "GeoLite2-City.mmdb");
if (existsSync(target)) {
	console.log("GeoLite2 City database already present.");
	process.exit(0);
}

const account = process.env.MAXMIND_ACCOUNT_ID;
const license = process.env.MAXMIND_LICENSE_KEY;
if (!account || !license) {
	console.warn("GeoLite2 City database not found; configure MAXMIND_ACCOUNT_ID and MAXMIND_LICENSE_KEY for production provisioning.");
	process.exit(0);
}

const credentials = Buffer.from(`${account}:${license}`).toString("base64");
const response = await fetch("https://download.maxmind.com/geoip/databases/GeoLite2-City/download?suffix=tar.gz", { headers: { Authorization: `Basic ${credentials}` } });
if (!response.ok) throw new Error(`GeoLite2 download failed (${response.status}).`);
const archive = "/tmp/geolite2-city.tar.gz";
await Bun.write(archive, await response.arrayBuffer());
await mkdir(join(process.cwd(), "data"), { recursive: true });
const extraction = Bun.spawn(["tar", "-xzf", archive, "-C", "/tmp"]);
if (await extraction.exited !== 0) throw new Error("Could not extract GeoLite2 City database.");
const found = (await Bun.$`find /tmp -name GeoLite2-City.mmdb -print -quit`.text()).trim();
if (!found) throw new Error("GeoLite2-City.mmdb was not found in the downloaded archive.");
await Bun.write(target, await Bun.file(found).arrayBuffer());
console.log("GeoLite2 City database provisioned.");
