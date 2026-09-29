import { describe, expect, test } from "bun:test";
import { getVisitorLocation, visitorIp } from "./location";

describe("trusted visitor IP", () => {
  const headers = new Headers({ "x-forwarded-for": "1.1.1.1, 8.8.8.8, 10.0.0.1" });
  test("headers are ignored unless proxy trust is explicitly enabled", () => {
    expect(visitorIp(headers, 0)).toBeNull();
  });
  test("counts trusted hops from the right, ignoring a spoofed leftmost address", () => {
    expect(visitorIp(headers, 2)).toBe("8.8.8.8");
    expect(visitorIp(headers, 1)).toBe("10.0.0.1");
  });
  test("rejects malformed, short and missing chains", () => {
    expect(visitorIp(headers, 4)).toBeNull();
    expect(visitorIp(new Headers(), 1)).toBeNull();
    expect(visitorIp(new Headers({ "x-forwarded-for": "not-an-ip" }), 1)).toBeNull();
  });
  test("accepts IPv6 and normalizes IPv4-mapped addresses", () => {
    expect(visitorIp(new Headers({ "x-forwarded-for": "::ffff:8.8.8.8" }), 1)).toBe("8.8.8.8");
    expect(visitorIp(new Headers({ "x-forwarded-for": "2001:4860:4860::8888" }), 1)).toBe("2001:4860:4860::8888");
  });
});

describe("local geolocation", () => {
  test("looks up a public address using the installed database", () => {
    expect(getVisitorLocation(new Headers({ "x-forwarded-for": "8.8.8.8" }), 1).country).toBe("United States");
  });
  test("does not invent cities for private, loopback or missing addresses", () => {
    for (const ip of ["127.0.0.1", "::1", "10.0.0.1", "192.168.1.2", "172.16.0.1"]) {
      expect(getVisitorLocation(new Headers({ "x-forwarded-for": ip }), 1).city).toBe("Location unknown");
    }
    expect(getVisitorLocation(new Headers(), 1).city).toBe("Location unknown");
  });
});
