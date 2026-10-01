"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { countryName, flag, getTopCountries } from "./countries";
import styles from "./ranking.module.css";
import { LoadingDots } from "./loading-dots";

export function Ranking({ ranking, loading, highlightedCountry, countryFlag }: { ranking: [string, number][]; loading: boolean; highlightedCountry?: string | null; countryFlag?: string }) {
  const reduced = useReducedMotion();
  const MotionLink = motion(Link);
  const [utcNow, setUtcNow] = useState<Date | null>(null);
  const countries = getTopCountries(ranking);
  useEffect(() => {
    const update = () => setUtcNow(new Date());
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, []);
  const utcLabel = utcNow
    ? `${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }).format(utcNow)} UTC`
    : "UTC";
  return (
    <section className={styles.board} aria-labelledby="ranking-title">
      <header className={styles.header}>
        <h2 id="ranking-title">{countryFlag ? `Ranking - ${countryName(countryFlag)}` : "World Ranking"}</h2>
        <span aria-label={`Current date and time: ${utcLabel}`}>{utcLabel}</span>
      </header>
      <ol className={`${styles.list} ${loading ? styles.loading : ""}`} aria-busy={loading}>
        {loading && <li className={styles.loadingRow}><LoadingDots label="Loading rankings" /></li>}
        {countries.map(([country, count], index) => (
          <li key={country}>
          {(() => {
            const Entry = countryFlag ? motion.div : MotionLink;
            return <Entry
            className={styles.entry}
            {...(!countryFlag ? { href: `/${country.toLowerCase()}` } : {})}
            layout={reduced ? false : "position"}
            transition={{ layout: { duration: reduced ? 0 : .5, ease: [.2, .8, .2, 1] } }}
          >
            <span className={styles.rank}>{index + 1}</span>
            <span className={styles.flag} aria-hidden="true">{flag(countryFlag ?? country)}</span>
            <span className={styles.name}>{countryName(country)}</span>
            <span className={`${styles.score} ${highlightedCountry === country ? styles.scoreFlash : ""}`} title={`${count.toLocaleString("en-US")} taps`}>
              {count.toLocaleString("en-US")}
            </span>
          </Entry>;
          })()}
          </li>
        ))}
        {!loading && countries.length === 0 && <li className={styles.emptyRow}>No data to display.</li>}
      </ol>
      {!loading && countries.length === 0 && !countryFlag && <p className={styles.empty}>Country rankings appear when location is available.</p>}
    </section>
  );
}
