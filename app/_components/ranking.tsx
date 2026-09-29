"use client";

import { motion, useReducedMotion } from "motion/react";
import { countryName, flag, formatCount, getTopCountries } from "./countries";
import styles from "./ranking.module.css";
import { LoadingDots } from "./loading-dots";

export function Ranking({ ranking, loading, highlightedCountry, movement }: { ranking: [string, number][]; loading: boolean; highlightedCountry?: string | null; movement?: { country: string; delta: number } | null }) {
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
          <motion.div
            className={styles.entry}
            layout={reduced ? false : "position"}
            transition={{ layout: { duration: reduced ? 0 : .5, ease: [.2, .8, .2, 1] } }}
          >
            <span className={styles.rank}>{index + 1}</span>
            {movement?.country === country && movement.delta !== 0 && <span className={`${styles.movement} ${movement.delta > 0 ? styles.up : styles.down}`}>{movement.delta > 0 ? "↑" : "↓"}{Math.abs(movement.delta)}</span>}
            <span className={styles.flag} aria-hidden="true">{flag(country)}</span>
            <span className={styles.name}>{countryName(country)}</span>
            <span className={`${styles.score} ${highlightedCountry === country ? styles.scoreFlash : ""}`} title={`${count.toLocaleString("en-US")} taps`}>{formatCount(count)}</span>
          </motion.div>
          </li>
        ))}
      </ol>
      {!loading && countries.length === 0 && <p className={styles.empty}>Country rankings appear when location is available.</p>}
    </section>
  );
}
