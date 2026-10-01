import { Hono } from "hono";
import { getStoredRanking, recordStoredTap } from "./counter-store";
import { getVisitorLocation, resolveLocation } from "./location";
import { z } from "zod";
import { listMilestones, recordMilestone } from "./milestones";
import { consumeTapNonce, getOrSetTapToken, issueTapNonce, validTapToken } from "./tap-token";
import { publishActivity, subscribeActivity } from "./activity";
import { streamSSE } from "hono/streaming";
import { getActiveBattle, recordBattleTap } from "./battles";
import { establishVerifiedTurnstileSession, hasVerifiedTurnstileSession, verifyTurnstileToken } from "./turnstile";
import { getRegionalRanking, recordRegionalTap } from "./regional-store";

const app = new Hono().basePath("/api");
const MAX_TAP_BODY_LENGTH = 4096;
const MAX_TURNSTILE_TOKEN_LENGTH = 2048;

app.get("/health", (context) => {
	context.header("Cache-Control", "no-store");
	return context.json({ status: "ok" });
});

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

app.get("/regional/:country", async (context) => {
	const country = context.req.param("country").toUpperCase();
	if (!/^[A-Z]{2}$/.test(country)) return context.json({ error: { code: "INVALID_COUNTRY" } }, 400);
	const tapToken = getOrSetTapToken(context.req.raw.headers, (name, value) => context.header(name, value));
	const worldRanking = await getStoredRanking();
	const countryName = new Intl.DisplayNames(["en"], { type: "region" }).of(country);
	const countryTotal = worldRanking.find((entry) => entry.country === countryName)?.count ?? 0;
	return context.json({ country, ranking: await getRegionalRanking(country), countryTotal, tapToken });
});

app.get("/tap-nonce", (context) => {
	const token = context.req.header("x-tap-token");
	if (!validTapToken(context.req.raw.headers, token) || !hasVerifiedTurnstileSession(token!)) {
		return context.json({ error: { code: "BOT_VERIFICATION_REQUIRED", message: "Bot verification is required." } }, 403);
	}
	const nonce = issueTapNonce(context.req.raw.headers);
	if (!nonce) return context.json({ error: { code: "INVALID_TAP_TOKEN", message: "Tap session is invalid. Reload the page." } }, 403);
	context.header("Cache-Control", "no-store");
	return context.json({ nonce });
});

app.get("/milestones", async (context) => context.json({ milestones: await listMilestones() }));

app.get("/battle", async (context) => {
	const scope = context.req.query("scope")?.toUpperCase() || "WW";
	if (scope === "WW") return context.json({ battle: await getActiveBattle(await getStoredRanking()) });
	if (!/^[A-Z]{2}$/.test(scope)) return context.json({ error: { code: "INVALID_COUNTRY" } }, 400);
	return context.json({ battle: await getActiveBattle((await getRegionalRanking(scope)).map((entry) => ({ country: entry.region, count: entry.count })), scope) });
});

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
const tapInput = locationInput.extend({
  tapNonce: z.string().regex(/^[a-f0-9]{48}$/),
  anonymous: z.boolean().default(false),
  scope: z.string().regex(/^[A-Z]{2}$/).optional(),
  deviceLocation: z.object({ country: z.string().trim().min(1).max(200), city: z.string().trim().max(200) }).strict().optional(),
}).strict();

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

app.post("/tap-verification", async (context) => {
	if (!isSameSiteOrigin(context.req.raw)) return context.json({ error: { code: "INVALID_ORIGIN", message: "Verification must come from this site." } }, 403);
	const tapToken = context.req.header("x-tap-token");
	if (!validTapToken(context.req.raw.headers, tapToken)) return context.json({ error: { code: "INVALID_TAP_TOKEN", message: "Tap session is invalid. Reload the page." } }, 403);
	const contentLength = Number(context.req.header("content-length") ?? 0);
	if (contentLength > MAX_TAP_BODY_LENGTH) return context.json({ error: { code: "PAYLOAD_TOO_LARGE", message: "Verification payload is too large." } }, 413);
	const body = await context.req.text();
	if (body.length > MAX_TAP_BODY_LENGTH) return context.json({ error: { code: "PAYLOAD_TOO_LARGE", message: "Verification payload is too large." } }, 413);
	let raw: unknown = null;
	try { raw = body ? JSON.parse(body) : null; } catch { raw = null; }
	const input = z.object({ turnstileToken: z.string().trim().min(1).max(MAX_TURNSTILE_TOKEN_LENGTH) }).strict().safeParse(raw);
	if (!input.success || !await verifyTurnstileToken(input.data.turnstileToken)) return context.json({ error: { code: "BOT_VERIFICATION_FAILED", message: "Bot verification failed. Try again." } }, 403);
	establishVerifiedTurnstileSession(tapToken!);
	return context.json({ verified: true });
});

app.post("/tap", async (context) => {
	if (!isSameSiteOrigin(context.req.raw)) {
		return context.json({ error: { code: "INVALID_ORIGIN", message: "Tap requests must come from this site." } }, 403);
	}
	if (!validTapToken(context.req.raw.headers, context.req.header("x-tap-token"))) {
		return context.json({ error: { code: "INVALID_TAP_TOKEN", message: "Tap session is invalid. Reload the page." } }, 403);
	}
	const contentLength = Number(context.req.header("content-length") ?? 0);
	if (contentLength > MAX_TAP_BODY_LENGTH) return context.json({ error: { code: "PAYLOAD_TOO_LARGE", message: "Tap payload is too large." } }, 413);
	const body = await context.req.text();
	if (body.length > MAX_TAP_BODY_LENGTH) return context.json({ error: { code: "PAYLOAD_TOO_LARGE", message: "Tap payload is too large." } }, 413);
  let raw: unknown = {};
  try { if (body) raw = JSON.parse(body); } catch { raw = null; }
	const input = tapInput.safeParse(raw);
	if (!input.success) return context.json({ error: { code: "INVALID_LOCATION", message: "Invalid location data." } }, 400);
	if (!hasVerifiedTurnstileSession(context.req.header("x-tap-token")!)) return context.json({ error: { code: "BOT_VERIFICATION_REQUIRED", message: "Bot verification is required." } }, 403);
	if (!consumeTapNonce(context.req.raw.headers, input.data.tapNonce)) return context.json({ error: { code: "INVALID_TAP_NONCE", message: "Tap request expired or was already used. Try again." } }, 403);
	const location = resolveLocation(context.req.raw.headers, input.data.ip, input.data.deviceLocation);
	const locationCountry = new Intl.DisplayNames(["en"], { type: "region" });
	const countryCode = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).flatMap((a) => Array.from({ length: 26 }, (_, j) => a + String.fromCharCode(65 + j))).find((code) => locationCountry.of(code) === location.country);
	if (input.data.scope && input.data.scope !== countryCode) return context.json({ ...location, accepted: false, points: 0, retryAfter: 0, ranking: [], regionalRanking: [], milestone: null, battle: null });
	const ranking = await recordStoredTap(location.country, 1);
	if (countryCode) await recordRegionalTap(countryCode, location.city);
	const regionalRanking = input.data.scope ? await getRegionalRanking(input.data.scope) : undefined;
	const countryTotal = input.data.scope ? ranking.find((entry) => entry.country === location.country)?.count ?? 0 : undefined;
	const milestone = await recordMilestone(ranking);
	const battleScope = input.data.scope ?? "WW";
	const battleRanking = input.data.scope
		? (regionalRanking ?? []).map((entry) => ({ country: entry.region, count: entry.count }))
		: ranking;
	const battleParticipant = input.data.scope ? location.city : location.country;
	const battle = await recordBattleTap(battleScope, battleParticipant, battleRanking);
	await publishActivity({ city: location.city, country: location.country, anonymous: input.data.anonymous, clientId: context.req.header("x-client-id"), battle });
	return context.json({ ...location, points: 1, retryAfter: 0, accepted: true, ranking, regionalRanking, countryTotal, milestone, battle });
});

export default app;
