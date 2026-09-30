"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { countryName, flag, getTopCountries } from "./countries";
import styles from "./ranking.module.css";
import { LoadingDots } from "./loading-dots";

export function Ranking({ ranking, loading, highlightedCountry }: { ranking: [string, number][]; loading: boolean; highlightedCountry?: string | null }) {
  const reduced = useReducedMotion();
  const [utcNow, setUtcNow] = useState<Date | null>(null);
  const countries = getTopCountries(ranking);
  useEffect(() => {
    const update = () => setUtcNow(new Date());
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, []);
  const utcLabel = utcNow
    ? `${new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(utcNow)} UTC`
    : "UTC";
  return (
    <section className={styles.board} aria-labelledby="ranking-title">
      <header className={styles.header}>
        <h2 id="ranking-title">World Ranking</h2>
        <span aria-label={`Current date and time: ${utcLabel}`}>{utcLabel}</span>
      </header>
      <ol className={`${styles.list} ${loading ? styles.loading : ""}`} aria-busy={loading}>
        {loading && <li className={styles.loadingRow}><LoadingDots label="Loading rankings" /></li>}
        {countries.map(([country, count], index) => (
          <li key={country}>
          {(() => {
            return <motion.div
            className={styles.entry}
            layout={reduced ? false : "position"}
            transition={{ layout: { duration: reduced ? 0 : .5, ease: [.2, .8, .2, 1] } }}
          >
            <span className={styles.rank}>{index + 1}</span>
            <span className={styles.flag} aria-hidden="true">{flag(country)}</span>
            <span className={styles.name}>{countryName(country)}</span>
            <span className={`${styles.score} ${highlightedCountry === country ? styles.scoreFlash : ""}`} title={`${count.toLocaleString("en-US")} taps`}>
              {count.toLocaleString("en-US")}
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
