import { Hono } from "hono";
import { getRanking, recordTap } from "./counter-store";
import { getVisitorLocation, resolveLocation } from "./location";
import { z } from "zod";
import { scoreTap } from "./tap-guard";

const app = new Hono().basePath("/api");

app.get("/ranking", (context) => context.json({ ranking: getRanking() }));

const locationInput = z.object({ ip: z.union([z.ipv4(), z.ipv6()]).optional() }).strict();

app.get("/location", (context) => context.json(getVisitorLocation(context.req.raw.headers)));

app.post("/location", async (context) => {
  const input = locationInput.safeParse(await context.req.json().catch(() => null));
  if (!input.success) return context.json({ error: { code: "INVALID_LOCATION", message: "Invalid IP address." } }, 400);
  return context.json(resolveLocation(context.req.raw.headers, input.data.ip));
});

app.post("/tap", async (context) => {
  const body = await context.req.text();
  let raw: unknown = {};
  try { if (body) raw = JSON.parse(body); } catch { raw = null; }
  const input = locationInput.safeParse(raw);
  if (!input.success) return context.json({ error: { code: "INVALID_LOCATION", message: "Invalid IP address." } }, 400);
  const location = resolveLocation(context.req.raw.headers, input.data.ip);
  const key = input.data.ip ?? "anonymous";
  const score = scoreTap(key);
  return context.json({ ...location, ...score, accepted: score.points > 0, ranking: recordTap(location.country, score.points) });
});

export default app;
