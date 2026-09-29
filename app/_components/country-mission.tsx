"use client";

import { useEffect, useMemo, useState } from "react";
import { countryCode, countryName, flag, formatCount } from "./countries";
import styles from "./country-mission.module.css";

const BATTLE_THRESHOLD = 10;
const BATTLE_GOAL = process.env.NODE_ENV === "development" ? 50 : 250;
type TapEvent = { id: number; country: string } | null;
type BattleState = { left: string; right: string; scores: Record<string, number>; frozen: Record<string, number>; completed?: boolean };

function savedBattle(): BattleState | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(window.localStorage.getItem("world-counter:battle") ?? "null");
    if (value?.completed) {
      window.localStorage.removeItem("world-counter:battle");
      return null;
    }
    if (!value || !/^[A-Z]{2}$/.test(value.left) || !/^[A-Z]{2}$/.test(value.right)) {
      window.localStorage.removeItem("world-counter:battle");
      return null;
    }
    return value;
  } catch { return null; }
}

export function CountryMission({ ranking, visitorCountry, tapEvent, onBattleStart, onBattleComplete }: { ranking: [string, number][]; visitorCountry: string | null; tapEvent: TapEvent; onBattleStart: (participants: [string, string], frozen: Record<string, number>) => void; onBattleComplete: () => void | Promise<void> }) {
  // Include 11th place so a country just outside the visible leaderboard can challenge 10th.
  const battleCountries = useMemo(() => ranking.filter(([country]) => country !== "WW").slice(0, 11)
    .map(([country, count]) => [countryCode(country), count] as [string, number]), [ranking]);
  const candidate = useMemo(() => battleCountries.slice(0, -1).map((entry, index) => [entry, battleCountries[index + 1]] as const)
    .filter(([left, right]) => left[1] - right[1] <= BATTLE_THRESHOLD && (left[0] === visitorCountry || right[0] === visitorCountry))
    .sort(([left, leftNext], [right, rightNext]) => (left[1] - leftNext[1]) - (right[1] - rightNext[1]))[0], [battleCountries, visitorCountry]);
  const candidateKey = candidate ? `${candidate[0][0]}:${candidate[1][0]}` : "";
  const [battle, setBattle] = useState<BattleState | null>(savedBattle);

  useEffect(() => {
    if (!battle && candidate) {
      const participants: [string, string] = [candidate[0][0], candidate[1][0]];
      const frozen = { [participants[0]]: candidate[0][1], [participants[1]]: candidate[1][1] };
      setBattle({ left: participants[0], right: participants[1], scores: { [participants[0]]: 0, [participants[1]]: 0 }, frozen });
      onBattleStart(participants, frozen);
    }
  }, [battle, candidateKey]);

  useEffect(() => {
    if (battle && !battle.completed && visitorCountry && [battle.left, battle.right].includes(visitorCountry)) onBattleStart([battle.left, battle.right], battle.frozen);
  }, [battle?.left, battle?.right, visitorCountry]);

  useEffect(() => {
    if (battle) window.localStorage.setItem("world-counter:battle", JSON.stringify(battle));
    else window.localStorage.removeItem("world-counter:battle");
  }, [battle]);

  useEffect(() => {
    if (!tapEvent || !battle || battle.completed || ![battle.left, battle.right].includes(tapEvent.country)) return;
    const score = Math.min(BATTLE_GOAL, (battle.scores[tapEvent.country] ?? 0) + 1);
    if (score >= BATTLE_GOAL) {
      setBattle({ ...battle, completed: true, scores: { ...battle.scores, [tapEvent.country]: score } });
      void Promise.resolve(onBattleComplete()).then(() => setBattle(null));
      return;
    }
    setBattle({ ...battle, scores: { ...battle.scores, [tapEvent.country]: score } });
  }, [tapEvent?.id]);

  if (!battle || battle.completed || !visitorCountry || ![battle.left, battle.right].includes(visitorCountry)) return null;
  return <Battle left={battle.left} right={battle.right} scores={battle.scores} tapEvent={tapEvent} />;
}

function Battle({ left, right, scores, tapEvent }: { left: string; right: string; scores: Record<string, number>; tapEvent: TapEvent }) {
  const leftScore = scores[left] ?? 0;
  const rightScore = scores[right] ?? 0;
  const leftWidth = Math.max(0, Math.min(100, 50 + ((leftScore - rightScore) / BATTLE_GOAL) * 50));
  return <section className={styles.card} aria-label="Country battle mission">
    <div className={styles.teams}>
      <div className={styles.team}><span className={styles.identity}><span className={styles.flag}>{flag(left)}</span><span><b>{countryName(left)}</b><small>{formatCount(leftScore)}/{BATTLE_GOAL} taps</small></span></span></div>
      <span className={styles.vs}>VS</span>
      <div className={`${styles.team} ${styles.teamRight}`}><span className={styles.identity}><span><b>{countryName(right)}</b><small>{formatCount(rightScore)}/{BATTLE_GOAL} taps</small></span><span className={styles.flag}>{flag(right)}</span></span></div>
    </div>
    <div className={styles.track} aria-label={`${countryName(left)} versus ${countryName(right)}`}>
      <span className={styles.leftTeam} style={{ width: `${leftWidth}%` }} />
      <span className={styles.rightTeam} style={{ width: `${100 - leftWidth}%` }} />
    </div>
  </section>;
}
