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
  expect(first).toEqual({ country: "United States", city: "", ip: "8.8.8.8" });
  expect(second).toEqual(first);
  await resolve();
  expect(calls).toHaveLength(3);
});

test("blocked discovery still allows unattributed taps", async () => {
  const request = (async () => { throw new Error("offline"); }) as unknown as typeof fetch;
  expect((await createLocationResolver(request)()).country).toBe("Worldwide");
});
