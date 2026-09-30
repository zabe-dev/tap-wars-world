import { randomBytes } from "node:crypto";

const COOKIE_NAME = "tap-token";

function readCookie(headers: Headers) {
	const cookies = headers.get("cookie")?.split(";") ?? [];
	return cookies.map((cookie) => cookie.trim().split("=")).find(([name]) => name === COOKIE_NAME)?.[1] ?? null;
}

export function getOrSetTapToken(headers: Headers, setHeader: (name: string, value: string) => void) {
	const existing = readCookie(headers);
	if (existing) return existing;
	const token = randomBytes(24).toString("hex");
	const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
	setHeader("Set-Cookie", `${COOKIE_NAME}=${token}; Path=/; SameSite=Strict${secure}`);
	return token;
}

export function validTapToken(headers: Headers, token: string | undefined) {
	const cookie = readCookie(headers);
	return Boolean(cookie && token && cookie === token);
}
