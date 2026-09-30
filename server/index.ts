import { Hono } from "hono";
import { getStoredRanking, recordStoredTap } from "./counter-store";
import { getVisitorLocation, resolveLocation, visitorIp } from "./location";
import { z } from "zod";
import { scoreTap } from "./tap-guard";
import { listMilestones, recordMilestone } from "./milestones";
import { getOrSetTapToken, validTapToken } from "./tap-token";
import { publishActivity, subscribeActivity } from "./activity";
import { streamSSE } from "hono/streaming";

const app = new Hono().basePath("/api");

app.get("/ranking", async (context) => {
	const tapToken = getOrSetTapToken(context.req.raw.headers, (name, value) => context.header(name, value));
	return context.json({ ranking: await getStoredRanking(), tapToken });
});

app.get("/milestones", async (context) => context.json({ milestones: await listMilestones() }));

app.get("/activity/stream", (context) => streamSSE(context, async (stream) => {
		await stream.writeSSE({ event: "ready", data: "{}" });
		await new Promise<void>((resolve) => {
			const unsubscribe = subscribeActivity((activity) => {
				void stream.writeSSE({ event: "tap", data: JSON.stringify(activity) });
			});
			stream.onAbort(() => { unsubscribe(); resolve(); });
		});
	}));

const locationInput = z.object({ ip: z.union([z.ipv4(), z.ipv6()]).optional() }).strict();

app.get("/location", (context) => context.json(getVisitorLocation(context.req.raw.headers)));

app.post("/location", async (context) => {
  const input = locationInput.safeParse(await context.req.json().catch(() => null));
  if (!input.success) return context.json({ error: { code: "INVALID_LOCATION", message: "Invalid IP address." } }, 400);
  return context.json(resolveLocation(context.req.raw.headers, input.data.ip));
});

app.post("/tap", async (context) => {
	const origin = context.req.header("origin");
	if (!origin || origin !== new URL(context.req.url).origin) {
		return context.json({ error: { code: "INVALID_ORIGIN", message: "Tap requests must come from this site." } }, 403);
	}
	if (!validTapToken(context.req.raw.headers, context.req.header("x-tap-token"))) {
		return context.json({ error: { code: "INVALID_TAP_TOKEN", message: "Tap session is invalid. Reload the page." } }, 403);
	}
	const contentLength = Number(context.req.header("content-length") ?? 0);
	if (contentLength > 2048) return context.json({ error: { code: "PAYLOAD_TOO_LARGE", message: "Tap payload is too large." } }, 413);
	const body = await context.req.text();
	if (body.length > 2048) return context.json({ error: { code: "PAYLOAD_TOO_LARGE", message: "Tap payload is too large." } }, 413);
  let raw: unknown = {};
  try { if (body) raw = JSON.parse(body); } catch { raw = null; }
  const input = locationInput.safeParse(raw);
	if (!input.success) return context.json({ error: { code: "INVALID_LOCATION", message: "Invalid IP address." } }, 400);
	const location = resolveLocation(context.req.raw.headers, input.data.ip);
	// When running behind a configured proxy, rate-limit the server-observed address;
	// never let a browser choose a new limiter key by changing its JSON payload.
	const trustedIp = visitorIp(context.req.raw.headers, Number(process.env.TRUSTED_PROXY_HOPS ?? 0));
	const key = trustedIp ?? `token:${context.req.header("x-tap-token")}`;
	const score = scoreTap(key);
	const accepted = score.points === 1;
	const ranking = await recordStoredTap(location.country, accepted ? 1 : 0);
	const milestone = accepted ? await recordMilestone(ranking) : null;
	if (accepted) await publishActivity({ country: location.country, clientId: context.req.header("x-client-id") });
	return context.json({ ...location, ...score, accepted, ranking, milestone });
});

export default app;
