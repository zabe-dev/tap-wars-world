const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 10_000;
const VERIFIED_SESSION_TTL_MS = 10 * 60 * 1000;
const verifiedSessions = new Map<string, number>();

type SiteverifyResponse = { success?: unknown; action?: unknown; hostname?: unknown };

function allowedHostnames() {
	return new Set((process.env.TURNSTILE_HOSTNAMES ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean));
}

function pruneSessions() {
	const now = Date.now();
	for (const [session, expiresAt] of verifiedSessions) if (expiresAt <= now) verifiedSessions.delete(session);
}

export function hasVerifiedTurnstileSession(session: string) {
	pruneSessions();
	const expiresAt = verifiedSessions.get(session);
	return Boolean(expiresAt && expiresAt > Date.now());
}

export function establishVerifiedTurnstileSession(session: string) {
	verifiedSessions.set(session, Date.now() + VERIFIED_SESSION_TTL_MS);
}

export async function verifyTurnstileToken(token: string) {
	const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
	const hostnames = allowedHostnames();
	if (!secret || hostnames.size === 0) return false;
	try {
		const response = await fetch(SITEVERIFY_URL, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({ secret, response: token }),
			signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
		});
		if (!response.ok) return false;
		const result = await response.json() as SiteverifyResponse;
		return result.success === true && result.action === "tap" && typeof result.hostname === "string" && hostnames.has(result.hostname.toLowerCase());
	} catch {
		return false;
	}
}
