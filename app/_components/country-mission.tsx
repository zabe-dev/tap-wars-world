"use client";

import { useEffect, useMemo, useState } from "react";
import { countryName, flag, formatCount, getTopCountries } from "./countries";
import styles from "./country-mission.module.css";

const BATTLE_THRESHOLD = 10;
const BATTLE_GOAL = 250;
type TapEvent = { id: number; country: string } | null;
type BattleState = { left: string; right: string; scores: Record<string, number>; frozen: Record<string, number> };

function savedBattle(): BattleState | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(window.localStorage.getItem("world-counter:battle") ?? "null");
    return value && typeof value.left === "string" && typeof value.right === "string" ? value : null;
  } catch { return null; }
}

export function CountryMission({ ranking, visitorCountry, tapEvent, onBattleStart, onBattleComplete }: { ranking: [string, number][]; visitorCountry: string | null; tapEvent: TapEvent; onBattleStart: (participants: [string, string], frozen: Record<string, number>) => void; onBattleComplete: () => void }) {
  const countries = getTopCountries(ranking);
  const candidate = useMemo(() => countries.slice(0, -1).map((entry, index) => [entry, countries[index + 1]] as const)
    .filter(([left, right]) => left[1] - right[1] <= BATTLE_THRESHOLD && (left[0] === visitorCountry || right[0] === visitorCountry))
    .sort(([left, leftNext], [right, rightNext]) => (left[1] - leftNext[1]) - (right[1] - rightNext[1]))[0], [countries, visitorCountry]);
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
    if (battle && visitorCountry && [battle.left, battle.right].includes(visitorCountry)) onBattleStart([battle.left, battle.right], battle.frozen);
  }, [battle?.left, battle?.right, visitorCountry]);

  useEffect(() => {
    if (battle) window.localStorage.setItem("world-counter:battle", JSON.stringify(battle));
    else window.localStorage.removeItem("world-counter:battle");
  }, [battle]);

  useEffect(() => {
    if (!tapEvent || !battle || ![battle.left, battle.right].includes(tapEvent.country)) return;
    const score = Math.min(BATTLE_GOAL, (battle.scores[tapEvent.country] ?? 0) + 1);
    if (score >= BATTLE_GOAL) { setBattle(null); onBattleComplete(); return; }
    setBattle({ ...battle, scores: { ...battle.scores, [tapEvent.country]: score } });
  }, [tapEvent?.id]);

  if (!battle || !visitorCountry || ![battle.left, battle.right].includes(visitorCountry)) return null;
  return <Battle left={battle.left} right={battle.right} scores={battle.scores} tapEvent={tapEvent} />;
}

function Battle({ left, right, scores, tapEvent }: { left: string; right: string; scores: Record<string, number>; tapEvent: TapEvent }) {
  const leftScore = scores[left] ?? 0;
  const rightScore = scores[right] ?? 0;
  const leftWidth = Math.max(0, Math.min(100, 50 + ((leftScore - rightScore) / BATTLE_GOAL) * 50));
  return <section className={styles.card} aria-label="Country battle mission">
    <div className={styles.teams}>
      <div className={styles.team}><span className={styles.identity}><span className={styles.flag}>{flag(left)}</span><span><b>{countryName(left)}</b><small key={tapEvent?.id} className={tapEvent?.country === left ? styles.tapFlash : ""}>{formatCount(leftScore)}/{BATTLE_GOAL} taps</small></span></span></div>
      <span className={styles.vs}>VS</span>
      <div className={`${styles.team} ${styles.teamRight}`}><span className={styles.identity}><span><b>{countryName(right)}</b><small key={tapEvent?.id} className={tapEvent?.country === right ? styles.tapFlash : ""}>{formatCount(rightScore)}/{BATTLE_GOAL} taps</small></span><span className={styles.flag}>{flag(right)}</span></span></div>
    </div>
    <div className={styles.track} aria-label={`${countryName(left)} versus ${countryName(right)}`}>
      <span className={styles.leftTeam} style={{ width: `${leftWidth}%` }} />
      <span className={styles.rightTeam} style={{ width: `${100 - leftWidth}%` }} />
    </div>
  </section>;
}
