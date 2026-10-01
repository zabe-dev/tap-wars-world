import { client } from "./db";

import type { BattleState } from "./battles";

type RankingUpdate = { country: string; count: number };
type RegionalUpdate = { region: string; count: number };
export type TapActivity = {
	city: string; country: string; anonymous: boolean; quiet?: boolean; clientId?: string; battle?: BattleState | null;
	ranking?: RankingUpdate[]; regionalRanking?: RegionalUpdate[]; countryTotal?: number;
};
type Subscriber = (activity: TapActivity) => void;
const subscribers = new Set<Subscriber>();
let listenerStarted = false;

function ensureListener() {
	if (listenerStarted || !client) return;
	listenerStarted = true;
	void client.listen("tap_activity", (payload) => {
		try {
			const activity = JSON.parse(payload) as TapActivity;
			if (typeof activity.city !== "string" || typeof activity.country !== "string" || typeof activity.anonymous !== "boolean") return;
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
