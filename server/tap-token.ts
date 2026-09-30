import { randomBytes } from "node:crypto";

const COOKIE_NAME = "tap-token";
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const NONCE_TTL_MS = 15_000;
const MAX_PENDING_NONCES = 4;
const issuedTokens = new Map<string, number>();
const pendingNonces = new Map<string, Map<string, number>>();

function readCookie(headers: Headers) {
	const cookies = headers.get("cookie")?.split(";") ?? [];
	return cookies.map((cookie) => cookie.trim().split("=")).find(([name]) => name === COOKIE_NAME)?.[1] ?? null;
}

export function getOrSetTapToken(headers: Headers, setHeader: (name: string, value: string) => void) {
	const existing = readCookie(headers);
	if (existing && isIssuedToken(existing)) return existing;
	const token = randomBytes(24).toString("hex");
	issuedTokens.set(token, Date.now() + TOKEN_TTL_MS);
	setHeader("Set-Cookie", `${COOKIE_NAME}=${token}; Max-Age=${TOKEN_TTL_MS / 1000}; Path=/; HttpOnly; SameSite=Strict; Secure`);
	return token;
}

export function validTapToken(headers: Headers, token: string | undefined) {
	const cookie = readCookie(headers);
	return Boolean(cookie && token && cookie === token && isIssuedToken(token));
}

function isIssuedToken(token: string) {
	const expiresAt = issuedTokens.get(token);
	if (!expiresAt) return false;
	if (expiresAt <= Date.now()) {
		issuedTokens.delete(token);
		pendingNonces.delete(token);
		return false;
	}
	return true;
}

function pruneNonces(token: string) {
	const nonces = pendingNonces.get(token);
	if (!nonces) return new Map<string, number>();
	const now = Date.now();
	for (const [nonce, expiresAt] of nonces) if (expiresAt <= now) nonces.delete(nonce);
	if (nonces.size === 0) pendingNonces.delete(token);
	return nonces;
}

export function issueTapNonce(headers: Headers) {
	const token = readCookie(headers);
	if (!token || !isIssuedToken(token)) return null;
	const nonces = pruneNonces(token);
	while (nonces.size >= MAX_PENDING_NONCES) {
		const oldest = nonces.keys().next().value;
		if (!oldest) break;
		nonces.delete(oldest);
	}
	const nonce = randomBytes(24).toString("hex");
	nonces.set(nonce, Date.now() + NONCE_TTL_MS);
	pendingNonces.set(token, nonces);
	return nonce;
}

export function consumeTapNonce(headers: Headers, nonce: string | undefined) {
	const token = readCookie(headers);
	if (!token || !nonce || !isIssuedToken(token)) return false;
	const nonces = pruneNonces(token);
	const expiresAt = nonces.get(nonce);
	if (!expiresAt || expiresAt <= Date.now()) return false;
	nonces.delete(nonce);
	if (nonces.size === 0) pendingNonces.delete(token);
	return true;
}
