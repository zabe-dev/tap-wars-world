import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { regionalCounts } from "./db/schema";

export type RegionalEntry = { region: string; count: number };

export async function recordRegionalTap(countryCode: string, region: string, points = 1) {
	if (!db) return;
	await db.insert(regionalCounts).values({ countryCode, region, tapCount: points })
		.onConflictDoUpdate({ target: [regionalCounts.countryCode, regionalCounts.region], set: { tapCount: sql`${regionalCounts.tapCount} + ${points}`, updatedAt: new Date() } });
}

export async function getRegionalRanking(countryCode: string): Promise<RegionalEntry[]> {
	if (!db) return [];
	const rows = await db.select({ region: regionalCounts.region, count: regionalCounts.tapCount })
		.from(regionalCounts).where(eq(regionalCounts.countryCode, countryCode))
		.orderBy(desc(regionalCounts.tapCount), asc(regionalCounts.region));
	return rows;
}
