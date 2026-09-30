import { client } from "./db";

export type TapActivity = { city: string; country: string; clientId?: string };
type Subscriber = (activity: TapActivity) => void;
const subscribers = new Set<Subscriber>();
let listenerStarted = false;

function ensureListener() {
	if (listenerStarted || !client) return;
	listenerStarted = true;
	void client.listen("tap_activity", (payload) => {
		try {
			const activity = JSON.parse(payload) as TapActivity;
			if (typeof activity.city !== "string" || typeof activity.country !== "string") return;
			subscribers.forEach((subscriber) => subscriber(activity));
		} catch {
			/* Ignore malformed notifications. */
		}
	}).catch((error) => {
		listenerStarted = false;
		console.error("Tap activity listener failed.", error);
	});
}

export function subscribeActivity(subscriber: Subscriber) {
	ensureListener();
	subscribers.add(subscriber);
	return () => subscribers.delete(subscriber);
}

export async function publishActivity(activity: TapActivity) {
	if (!client) {
		subscribers.forEach((subscriber) => subscriber(activity));
		return;
	}
	try {
		await client.notify("tap_activity", JSON.stringify(activity));
	} catch (error) {
		console.error("Tap activity notification failed.", error);
	}
}
