import { afterEach, expect, spyOn, test } from "bun:test";
import geoip from "geoip-lite";
import app from "./index";

const originalHops = process.env.TRUSTED_PROXY_HOPS;
async function tapRequest(options: RequestInit = {}) {
	const session = await app.request("/api/ranking");
	const { tapToken } = await session.json() as { tapToken: string };
	const cookie = session.headers.get("set-cookie")?.split(";", 1)[0] ?? "";
	return app.request("/api/tap", {
		...options,
		headers: { ...(options.headers as Record<string, string> | undefined), origin: "http://localhost", cookie, "x-tap-token": tapToken },
	});
}
afterEach(() => {
  if (originalHops === undefined) delete process.env.TRUSTED_PROXY_HOPS;
  else process.env.TRUSTED_PROXY_HOPS = originalHops;
});

test("visitor location responses cannot enter shared caches", async () => {
  for (const options of [{}, { method: "POST", body: "{}" }]) {
    const response = await app.request("/api/location", options);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  }
});

test("missing proxy city never lets a browser change the trusted country", async () => {
  process.env.TRUSTED_PROXY_HOPS = "1";
  const lookup = spyOn(geoip, "lookup").mockImplementation((ip) => ({
    range: [0, 0], country: ip === "8.8.8.8" ? "US" : "PH", region: "", eu: "0",
    timezone: "", city: ip === "8.8.8.8" ? "" : "Manila", ll: [0, 0], metro: 0, area: 0,
  }));
  try {
    const response = await app.request("/api/location", {
      method: "POST", headers: { "x-forwarded-for": "8.8.8.8" }, body: JSON.stringify({ ip: "1.1.1.1" }),
    });
    expect(await response.json()).toEqual({ country: "United States", city: "" });
    expect(lookup).toHaveBeenCalledTimes(1);
  } finally {
    lookup.mockRestore();
  }
});

test("tap uses proxy IP and merges into the existing country ranking", async () => {
  process.env.TRUSTED_PROXY_HOPS = "1";
  const before = await (await app.request("/api/ranking")).json();
	const previous = before.ranking.find((entry: { country: string }) => entry.country === "United States")?.count ?? 0;
  const response = await tapRequest({
    method: "POST",
    headers: { "x-forwarded-for": "8.8.8.8", "x-vercel-ip-country": "PH" },
  });
  const data = await response.json();
  expect(response.status).toBe(200);
  expect(data.country).toBe("United States");
  expect(data.ranking.find((entry: { country: string }) => entry.country === data.country).count).toBe(previous + 1);
});

test("tap still counts without a location", async () => {
  process.env.TRUSTED_PROXY_HOPS = "1";
  const response = await tapRequest({ method: "POST" });
  const data = await response.json();
  expect(response.status).toBe(200);
  expect(data.city).toBe("Location unknown");
  expect(data.ranking.some((entry: { country: string }) => entry.country === "Worldwide")).toBe(true);
});

test("localhost public-IP fallback increments the actual resolved country", async () => {
  process.env.TRUSTED_PROXY_HOPS = "0";
  const body = JSON.stringify({ ip: "8.8.8.8" });
  const options = { method: "POST", headers: { "Content-Type": "application/json" }, body };
  const location = await (await app.request("/api/location", options)).json();
  expect(location.country).toBe("United States");
  const before = await (await app.request("/api/ranking")).json();
	const previous = before.ranking.find((entry: { country: string }) => entry.country === location.country)?.count ?? 0;
  const taped = await (await tapRequest(options)).json();
  expect(taped.country).toBe(location.country);
  expect(taped.ranking.find((entry: { country: string }) => entry.country === location.country).count).toBe(previous + 1);
});

test("approved device location is used for the tap attribution", async () => {
  process.env.TRUSTED_PROXY_HOPS = "0";
  const response = await tapRequest({
    method: "POST",
    body: JSON.stringify({ deviceLocation: { country: "Philippines", city: "Angeles City" } }),
  });
  const data = await response.json();
  expect(response.status).toBe(200);
  expect(data.country).toBe("Philippines");
  expect(data.city).toBe("Angeles City");
});

test("invalid browser input cannot change the ranking", async () => {
  const before = await (await app.request("/api/ranking")).json();
  for (const body of ['{"ip":"invalid"}', '{"country":"Philippines"}', "{"]) {
    const response = await tapRequest({ method: "POST", body });
    expect(response.status).toBe(400);
  }
  expect((await (await app.request("/api/ranking")).json()).ranking).toEqual(before.ranking);
});

test("tap rejects cross-site browser requests", async () => {
	const before = await (await app.request("/api/ranking")).json();
	const response = await app.request("/api/tap", {
		method: "POST",
		headers: { origin: "https://attacker.example" },
	});
	expect(response.status).toBe(403);
	expect((await (await app.request("/api/ranking")).json()).ranking).toEqual(before.ranking);
});

test("tap accepts the public host behind a TLS-terminating proxy", async () => {
	const session = await app.request("/api/ranking", { headers: { host: "tapwars.world" } });
	const { tapToken } = await session.json() as { tapToken: string };
	const cookie = session.headers.get("set-cookie")?.split(";", 1)[0] ?? "";
	const response = await app.request("http://10.0.1.20:3000/api/tap", {
		method: "POST",
		headers: { origin: "https://tapwars.world", host: "10.0.1.20:3000", "x-forwarded-host": "tapwars.world", cookie, "x-tap-token": tapToken },
	});
	expect(response.status).toBe(200);
});

test("trusted proxy location takes priority over browser fallback", async () => {
  process.env.TRUSTED_PROXY_HOPS = "1";
  const response = await app.request("/api/location", {
    method: "POST", headers: { "x-forwarded-for": "8.8.8.8" },
    body: JSON.stringify({ ip: "127.0.0.1" }),
  });
  expect((await response.json()).country).toBe("United States");
});
