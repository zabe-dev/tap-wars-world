import { expect, test } from "bun:test";
import { createDeviceLocationResolver, resolveDeviceLocation } from "./device-location";

const geolocation = {
  getCurrentPosition(success: PositionCallback) {
    success({ coords: { latitude: 14.5995, longitude: 120.9842 } } as GeolocationPosition);
  },
} as Geolocation;

test("device coordinates resolve city and canonical country directly in browser", async () => {
  const request = (async (url: string, options: RequestInit) => {
    expect(url).toContain("latitude=14.5995&longitude=120.9842");
    expect(options.credentials).toBe("omit");
    return Response.json({ countryCode: "PH", city: "Manila" });
  }) as typeof fetch;
  expect(await resolveDeviceLocation(geolocation, request)).toEqual({ city: "Manila", country: "Philippines" });
});

test("locality fills missing city but missing country is rejected", async () => {
  const request = (async () => Response.json({ countryCode: "PH", city: "", locality: "Makati" })) as unknown as typeof fetch;
  expect((await resolveDeviceLocation(geolocation, request)).city).toBe("Makati");
  const invalid = (async () => Response.json({ city: "Manila" })) as unknown as typeof fetch;
  await expect(resolveDeviceLocation(geolocation, invalid)).rejects.toThrow("invalid location");
});

test("permission denial never contacts the provider", async () => {
  let calls = 0;
  const denied = { getCurrentPosition(_: PositionCallback, reject: PositionErrorCallback) { reject({ code: 1 } as GeolocationPositionError); } } as Geolocation;
  const request = (async () => { calls++; return Response.json({}); }) as unknown as typeof fetch;
  await expect(resolveDeviceLocation(denied, request)).rejects.toThrow("permission denied");
  expect(calls).toBe(0);
});

test("provider failures back off without automatic retries", async () => {
  let time = 0;
  let calls = 0;
  const resolve = createDeviceLocationResolver(() => time);
  const request = (async () => { calls++; return new Response(null, { status: 429 }); }) as unknown as typeof fetch;
  await expect(resolve(geolocation, request)).rejects.toThrow("unavailable");
  await expect(resolve(geolocation, request)).rejects.toThrow("wait 30 seconds");
  expect(calls).toBe(1);
  time = 30_000;
  await expect(resolve(geolocation, request)).rejects.toThrow("unavailable");
  expect(calls).toBe(2);
});
