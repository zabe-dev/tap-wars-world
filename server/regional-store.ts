import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { regionalCounts } from "./db/schema";
import { REGIONAL_SEEDS } from "./seed-data";

export type RegionalEntry = { region: string; count: number };

export async function recordRegionalTap(countryCode: string, region: string) {
	if (!db) return;
	await db.insert(regionalCounts).values({ countryCode, region, tapCount: 1 })
		.onConflictDoUpdate({ target: [regionalCounts.countryCode, regionalCounts.region], set: { tapCount: sql`${regionalCounts.tapCount} + 1`, updatedAt: new Date() } });
}

export async function getRegionalRanking(countryCode: string): Promise<RegionalEntry[]> {
	if (!db) return [];
	const seeds = REGIONAL_SEEDS[countryCode as keyof typeof REGIONAL_SEEDS];
	if (seeds) await db.insert(regionalCounts).values(seeds.map(([region, tapCount]) => ({ countryCode, region, tapCount }))).onConflictDoNothing();
	const rows = await db.select({ region: regionalCounts.region, count: regionalCounts.tapCount })
		.from(regionalCounts).where(eq(regionalCounts.countryCode, countryCode))
		.orderBy(desc(regionalCounts.tapCount), asc(regionalCounts.region));
	return rows;
}
