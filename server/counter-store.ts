import { asc, desc, sql } from "drizzle-orm";
import { db } from "./db";
import { countryCounts } from "./db/schema";

/** One country and its accumulated tap count. */
export type RankingEntry = { country: string; count: number };

const counts = new Map<string, number>([
	// Tight demo scores let a few taps visibly change the ranking.
	["Japan", 110],
	["United States", 109],
	["Brazil", 108],
	["Australia", 107],
	["Germany", 106],
	["Canada", 105],
	["Singapore", 104],
	["Philippines", 99],
	["South Korea", 102],
	["India", 101],
	["Mexico", 100],
]);

/** Increment one country and return the current sorted global ranking. */
export function recordTap(country: string, points = 1): RankingEntry[] {
	if (points > 0) counts.set(country, (counts.get(country) ?? 0) + points);
	return getRanking();
}

/** Return current ranking, sorted by taps then country name. */
export function getRanking(): RankingEntry[] {
	return [...counts.entries()]
		.map(([country, count]) => ({ country, count }))
		.sort((a, b) => b.count - a.count || a.country.localeCompare(b.country));
}

let databaseReady: Promise<void> | null = null;

async function ensureDatabase(database: NonNullable<typeof db>) {
	databaseReady ??= database.insert(countryCounts)
		.values([...counts.entries()].map(([country, tapCount]) => ({ country, tapCount })))
		.onConflictDoNothing()
		.then(() => undefined);
	await databaseReady;
}

/** Read durable totals when PostgreSQL is configured, otherwise use the local fallback. */
export async function getStoredRanking(): Promise<RankingEntry[]> {
	if (!db) return getRanking();
	try {
		await ensureDatabase(db);
		const rows = await db.select().from(countryCounts)
			.orderBy(desc(countryCounts.tapCount), asc(countryCounts.country));
		return rows.map((row) => ({ country: row.country, count: row.tapCount }));
	} catch (error) {
		console.error("PostgreSQL ranking read failed; using in-memory fallback.", error);
		return getRanking();
	}
}

/** Atomically add accepted taps to a country and return durable totals. */
export async function recordStoredTap(country: string, points = 1): Promise<RankingEntry[]> {
	if (!db) return recordTap(country, points);
	try {
		await ensureDatabase(db);
		if (points > 0) {
			await db.insert(countryCounts).values({ country, tapCount: points, updatedAt: new Date() })
				.onConflictDoUpdate({
					target: countryCounts.country,
					set: {
						tapCount: sql`${countryCounts.tapCount} + ${points}`,
						updatedAt: new Date(),
					},
				});
		}
		return getStoredRanking();
	} catch (error) {
		console.error("PostgreSQL tap write failed; using in-memory fallback.", error);
		return recordTap(country, points);
	}
}
