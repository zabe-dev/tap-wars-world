"use client";

import { motion, useReducedMotion } from "motion/react";
import { countryName, flag, formatCount, getTopCountries } from "./countries";
import styles from "./ranking.module.css";
import { LoadingDots } from "./loading-dots";

export function Ranking({ ranking, loading, highlightedCountry, addedTaps, settlement }: { ranking: [string, number][]; loading: boolean; highlightedCountry?: string | null; addedTaps?: { country: string; amount: number } | null; settlement?: { country: string; total: number; consumed: number } | null }) {
  const reduced = useReducedMotion();
  const countries = getTopCountries(ranking);
  return (
    <section className={styles.board} aria-labelledby="ranking-title">
      <header className={styles.header}>
        <h2 id="ranking-title">Top 10 countries</h2>
        <span>By total taps</span>
      </header>
      <ol className={`${styles.list} ${loading ? styles.loading : ""}`} aria-busy={loading}>
        {loading && <li className={styles.loadingRow}><LoadingDots label="Loading rankings" /></li>}
        {countries.map(([country, count], index) => (
          <li key={country}>
          {(() => {
            const consumed = settlement?.country === country ? settlement.consumed : 0;
            const displayCount = count + consumed;
            const remaining = addedTaps?.country === country ? addedTaps.amount - consumed : 0;
            return <motion.div
            className={styles.entry}
            layout={reduced ? false : "position"}
            transition={{ layout: { duration: reduced ? 0 : .5, ease: [.2, .8, .2, 1] } }}
          >
            <span className={styles.rank}>{index + 1}</span>
            <span className={styles.flag} aria-hidden="true">{flag(country)}</span>
            <span className={styles.name}>{countryName(country)}</span>
            <span key={settlement?.country === country ? settlement.consumed : "stable"} className={`${styles.score} ${highlightedCountry === country || (settlement?.country === country && consumed > 0) ? styles.scoreFlash : ""}`} title={`${displayCount.toLocaleString("en-US")} taps`}>
              {formatCount(displayCount)}
              {remaining > 0 && <em className={styles.added}>+{formatCount(remaining)}</em>}
            </span>
          </motion.div>;
          })()}
          </li>
        ))}
      </ol>
      {!loading && countries.length === 0 && <p className={styles.empty}>Country rankings appear when location is available.</p>}
    </section>
  );
}
