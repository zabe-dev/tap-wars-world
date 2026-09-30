import { Hono } from "hono";
import { getStoredRanking, recordStoredTap } from "./counter-store";
import { getVisitorLocation, resolveLocation, visitorIp } from "./location";
import { z } from "zod";
import { scoreTap } from "./tap-guard";
import { listMilestones, recordMilestone } from "./milestones";
import { getOrSetTapToken, validTapToken } from "./tap-token";
import { publishActivity, subscribeActivity } from "./activity";
import { streamSSE } from "hono/streaming";
import { getActiveBattle, recordBattleTap } from "./battles";

const app = new Hono().basePath("/api");

function isSameSiteOrigin(request: Request) {
	const origin = request.headers.get("origin");
	if (!origin) return false;
	try {
		const originUrl = new URL(origin);
		const forwardedHost = request.headers.get("x-forwarded-host")?.split(",", 1)[0]?.trim();
		const requestHost = forwardedHost || request.headers.get("host") || new URL(request.url).host;
		return originUrl.host === requestHost;
	} catch {
		return false;
	}
}

app.get("/ranking", async (context) => {
	const tapToken = getOrSetTapToken(context.req.raw.headers, (name, value) => context.header(name, value));
	return context.json({ ranking: await getStoredRanking(), tapToken });
});

app.get("/milestones", async (context) => context.json({ milestones: await listMilestones() }));

app.get("/battle", async (context) => context.json({ battle: await getActiveBattle(await getStoredRanking()) }));

app.get("/activity/stream", (context) => streamSSE(context, async (stream) => {
		await stream.writeSSE({ event: "ready", data: "{}" });
		try {
			const battle = await getActiveBattle(await getStoredRanking());
			if (battle) await stream.writeSSE({ event: "battle", data: JSON.stringify(battle) });
		} catch {
			/* The activity stream remains available if the initial battle read fails. */
		}
		await new Promise<void>((resolve) => {
			const unsubscribe = subscribeActivity((activity) => {
				void stream.writeSSE({ event: "tap", data: JSON.stringify(activity) });
			});
			const heartbeat = setInterval(() => { void stream.writeSSE({ event: "heartbeat", data: "{}" }); }, 15_000);
			stream.onAbort(() => { clearInterval(heartbeat); unsubscribe(); resolve(); });
		});
	}));

const locationInput = z.object({ ip: z.union([z.ipv4(), z.ipv6()]).optional() }).strict();

app.use("/location", async (context, next) => {
  context.header("Cache-Control", "private, no-store");
  await next();
});

app.get("/location", (context) => context.json(getVisitorLocation(context.req.raw.headers)));

app.post("/location", async (context) => {
  const input = locationInput.safeParse(await context.req.json().catch(() => null));
  if (!input.success) return context.json({ error: { code: "INVALID_LOCATION", message: "Invalid IP address." } }, 400);
  return context.json(resolveLocation(context.req.raw.headers, input.data.ip));
});

app.post("/tap", async (context) => {
	if (!isSameSiteOrigin(context.req.raw)) {
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
	const battle = accepted ? await recordBattleTap(location.country, ranking) : await getActiveBattle(ranking);
	if (accepted) await publishActivity({ city: location.city, country: location.country, clientId: context.req.header("x-client-id"), battle });
	return context.json({ ...location, ...score, accepted, ranking, milestone, battle });
});

export default app;
