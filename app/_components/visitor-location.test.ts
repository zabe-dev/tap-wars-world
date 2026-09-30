import { expect, test } from "bun:test";
import { createLocationResolver } from "./visitor-location";

test("uses the proxy location without contacting ipify", async () => {
  const calls: string[] = [];
  const request = (async (url: string) => {
    calls.push(url);
    return Response.json({ country: "Philippines", city: "Manila" });
  }) as typeof fetch;
  expect((await createLocationResolver(request)()).country).toBe("Philippines");
  expect(calls).toEqual(["/api/location"]);
});

test("localhost discovers the browser IP and resolves it on our server only once", async () => {
  const calls: string[] = [];
  const request = (async (url: string, options?: RequestInit) => {
    calls.push(url);
    if (url.startsWith("https://")) return Response.json({ ip: "8.8.8.8" });
    if (options?.method === "POST") {
      expect(JSON.parse(options.body as string)).toEqual({ ip: "8.8.8.8" });
      return Response.json({ country: "United States", city: "" });
    }
    return Response.json({ country: "Worldwide", city: "Location unknown" });
  }) as typeof fetch;
  const resolve = createLocationResolver(request);
  const [first, second] = await Promise.all([resolve(), resolve()]);
  expect(first).toEqual({ country: "United States", city: "Washington, D.C.", ip: "8.8.8.8" });
  expect(second).toEqual(first);
  await resolve();
  expect(calls).toHaveLength(3);
});

test("blocked discovery still allows unattributed taps", async () => {
  const request = (async () => { throw new Error("offline"); }) as unknown as typeof fetch;
  expect((await createLocationResolver(request)()).country).toBe("Worldwide");
});

test("country-only results avoid discovery and preserve attribution", async () => {
  let calls = 0;
  const request = (async () => {
    calls++;
    return Response.json({ country: "Philippines", city: "" });
  }) as unknown as typeof fetch;
  expect(await createLocationResolver(request)()).toEqual({ country: "Philippines", city: "Manila" });
  expect(calls).toBe(1);
});

test("failed initial lookup still attempts browser discovery", async () => {
  let calls = 0;
  const request = (async () => {
    calls++;
    if (calls === 1) throw new Error("timeout");
    return Response.json(calls === 2 ? { ip: "8.8.8.8" } : { country: "United States", city: "" });
  }) as unknown as typeof fetch;
  expect((await createLocationResolver(request)()).country).toBe("United States");
  expect(calls).toBe(3);
});

test("failed results back off then recover; successful results expire", async () => {
  let time = 0;
  let offline = true;
  let calls = 0;
  const request = (async () => {
    calls++;
    if (offline) throw new Error("offline");
    return Response.json({ country: "Philippines", city: "Manila" });
  }) as unknown as typeof fetch;
  const resolve = createLocationResolver(request, () => time);
  await resolve();
  const failedCalls = calls;
  offline = false;
  expect((await resolve()).country).toBe("Worldwide");
  expect(calls).toBe(failedCalls);
  time = 30_000;
  expect((await resolve()).city).toBe("Manila");
  time += 299_999;
  await resolve();
  expect(calls).toBe(failedCalls + 1);
  time++;
  await Promise.all([resolve(), resolve()]);
  expect(calls).toBe(failedCalls + 2);
});
