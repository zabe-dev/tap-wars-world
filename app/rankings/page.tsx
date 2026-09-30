import Link from "next/link";
import { getStoredRanking } from "@/server/counter-store";
import { countryCode, countryName, flag, formatCount } from "../_components/countries";
import styles from "./rankings.module.css";

const PAGE_SIZE = 25;
export const dynamic = "force-dynamic";
export const metadata = { title: "All rankings · tapwars.world" };

export default async function RankingsPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
	const ranking = await getStoredRanking();
	const requestedPage = Number((await searchParams).page ?? "1");
	const pageCount = Math.max(1, Math.ceil(ranking.length / PAGE_SIZE));
	const page = Number.isInteger(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
	const entries = ranking.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	return <main className={styles.page}><article className={styles.content}>
		<Link className={styles.back} href="/">← Back to tapwars.world</Link>
		<header className={styles.header}><div><h1>All country rankings</h1><p>Every recorded country total, ranked by taps.</p></div><span>{ranking.length} countries</span></header>
		{entries.length === 0 ? <p className={styles.empty}>No country taps have been recorded yet.</p> : <ol className={styles.list} start={(page - 1) * PAGE_SIZE + 1}>
			{entries.map((entry) => { const code = countryCode(entry.country); return <li key={entry.country}><span className={styles.rank}>{ranking.indexOf(entry) + 1}</span><span className={styles.flag}>{flag(code)}</span><span className={styles.name}>{countryName(code)}</span><strong>{formatCount(entry.count)}</strong></li>; })}
		</ol>}
		<nav className={styles.pagination} aria-label="Ranking pages">
			{page > 1 ? <Link href={`/rankings?page=${page - 1}`}>← Previous</Link> : <span />}
			<span>Page {page} of {pageCount}</span>
			{page < pageCount ? <Link href={`/rankings?page=${page + 1}`}>Next →</Link> : <span />}
		</nav>
	</article></main>;
}
