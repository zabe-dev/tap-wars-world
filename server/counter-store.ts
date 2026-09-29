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
