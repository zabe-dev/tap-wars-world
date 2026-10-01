"use client";

import { useEffect, useState } from "react";
import { countryCode, countryName, flag, formatCount } from "./countries";
import styles from "./country-mission.module.css";

type BattleState = { scope: string; left: string; right: string; scores: Record<string, number>; frozen: Record<string, number>; completed?: boolean };
type SharedBattle = BattleState | null;
const BATTLE_SWING = 250;

export function CountryMission({ visitorCountry, visitorCity, scope, sharedBattle }: { visitorCountry: string | null; visitorCity: string | null; scope?: string; sharedBattle: SharedBattle }) {
  const [battle, setBattle] = useState<BattleState | null>(null);

  useEffect(() => {
    if (!sharedBattle) { setBattle(null); return; }
    const cityBattle = sharedBattle.scope !== "WW";
    const left = cityBattle ? sharedBattle.left : countryCode(sharedBattle.left);
    const right = cityBattle ? sharedBattle.right : countryCode(sharedBattle.right);
    const normalized: BattleState = {
      left,
      right,
      scores: { [left]: sharedBattle.scores[sharedBattle.left] ?? 0, [right]: sharedBattle.scores[sharedBattle.right] ?? 0 },
      frozen: { [left]: sharedBattle.frozen[sharedBattle.left] ?? 0, [right]: sharedBattle.frozen[sharedBattle.right] ?? 0 },
      completed: sharedBattle.completed,
      scope: sharedBattle.scope,
    };
    setBattle(normalized);
    if (normalized.completed) { setBattle(null); return; }
	}, [sharedBattle]);

  if (!battle || battle.completed) return null;
  const participating = battle.scope === "WW"
    ? Boolean(visitorCountry && [battle.left, battle.right].includes(visitorCountry))
    : Boolean(scope && visitorCountry === scope && visitorCity && [battle.left, battle.right].some((city) => city.toLowerCase() === visitorCity.toLowerCase()));
  if (!participating) return null;
  return <Battle cityBattle={battle.scope !== "WW"} left={battle.left} right={battle.right} scores={battle.scores} />;
}

function Battle({ left, right, scores, cityBattle }: { left: string; right: string; scores: Record<string, number>; cityBattle: boolean }) {
  const leftScore = scores[left] ?? 0;
  const rightScore = scores[right] ?? 0;
  const leftWidth = Math.max(0, Math.min(100, 50 + ((leftScore - rightScore) / BATTLE_SWING) * 50));
  return <section className={styles.card} aria-label={cityBattle ? "City battle mission" : "Country battle mission"}>
    <div className={styles.teams}>
      <div className={styles.team}><span className={styles.identity}>{!cityBattle && <span className={styles.flag}>{flag(left)}</span>}<span><b>{cityBattle ? left : countryName(left)}</b><small>{formatCount(leftScore)} taps</small></span></span></div>
      <span className={styles.vs}>VS</span>
      <div className={`${styles.team} ${styles.teamRight}`}><span className={styles.identity}><span><b>{cityBattle ? right : countryName(right)}</b><small>{formatCount(rightScore)} taps</small></span>{!cityBattle && <span className={styles.flag}>{flag(right)}</span>}</span></div>
    </div>
    <div className={styles.track} aria-label={`${cityBattle ? left : countryName(left)} versus ${cityBattle ? right : countryName(right)}`}>
      <span className={styles.leftTeam} style={{ width: `${leftWidth}%` }} />
      <span className={styles.rightTeam} style={{ width: `${100 - leftWidth}%` }} />
    </div>
  </section>;
}
