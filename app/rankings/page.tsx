import Link from "next/link";
import { getStoredRanking } from "@/server/counter-store";
import { RankingEntries } from "./ranking-entries";
import styles from "./rankings.module.css";

const PAGE_SIZE = 25;
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = { title: "World Ranking · tapwars.world" };

export default async function RankingsPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
	const ranking = (await getStoredRanking()).filter((entry) => entry.country !== "Worldwide" && entry.country !== "WW");
	const requestedPage = Number((await searchParams).page ?? "1");
	const pageCount = Math.max(1, Math.ceil(ranking.length / PAGE_SIZE));
	const page = Number.isInteger(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
	const entries = ranking.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	return <main className={styles.page}><Link className={styles.back} href="/">← Back</Link><article className={styles.content}>
		<header className={styles.header}><div><h1>World Ranking</h1><p>Every recorded country total, ranked by taps.</p></div><span>{ranking.length} countries</span></header>
		{entries.length === 0 ? <p className={styles.empty}>No country taps have been recorded yet.</p> : <RankingEntries initialEntries={entries} initialRanking={ranking} offset={(page - 1) * PAGE_SIZE} />}
		<nav className={styles.pagination} aria-label="Ranking pages">
			{page > 1 ? <Link href={`/rankings?page=${page - 1}`}>← Previous</Link> : <span />}
			<span>Page {page} of {pageCount}</span>
			{page < pageCount ? <Link href={`/rankings?page=${page + 1}`}>Next →</Link> : <span />}
		</nav>
	</article></main>;
}
