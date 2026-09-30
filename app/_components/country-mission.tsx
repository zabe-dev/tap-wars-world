"use client";

import { useEffect, useState } from "react";
import { countryCode, countryName, flag, formatCount } from "./countries";
import styles from "./country-mission.module.css";

type BattleState = { left: string; right: string; scores: Record<string, number>; frozen: Record<string, number>; completed?: boolean };
type SharedBattle = { left: string; right: string; scores: Record<string, number>; frozen: Record<string, number>; completed?: boolean } | null;
const BATTLE_SWING = 250;

export function CountryMission({ visitorCountry, sharedBattle }: { visitorCountry: string | null; sharedBattle: SharedBattle }) {
  const [battle, setBattle] = useState<BattleState | null>(null);

  useEffect(() => {
    if (!sharedBattle) { setBattle(null); return; }
    const left = countryCode(sharedBattle.left);
    const right = countryCode(sharedBattle.right);
    const normalized: BattleState = {
      left,
      right,
      scores: { [left]: sharedBattle.scores[sharedBattle.left] ?? 0, [right]: sharedBattle.scores[sharedBattle.right] ?? 0 },
      frozen: { [left]: sharedBattle.frozen[sharedBattle.left] ?? 0, [right]: sharedBattle.frozen[sharedBattle.right] ?? 0 },
      completed: sharedBattle.completed,
    };
    setBattle(normalized);
    if (normalized.completed) { setBattle(null); return; }
	}, [sharedBattle]);

  if (!battle || battle.completed || !visitorCountry || ![battle.left, battle.right].includes(visitorCountry)) return null;
  return <Battle left={battle.left} right={battle.right} scores={battle.scores} />;
}

function Battle({ left, right, scores }: { left: string; right: string; scores: Record<string, number> }) {
  const leftScore = scores[left] ?? 0;
  const rightScore = scores[right] ?? 0;
  const leftWidth = Math.max(0, Math.min(100, 50 + ((leftScore - rightScore) / BATTLE_SWING) * 50));
  return <section className={styles.card} aria-label="Country battle mission">
    <div className={styles.teams}>
      <div className={styles.team}><span className={styles.identity}><span className={styles.flag}>{flag(left)}</span><span><b>{countryName(left)}</b><small>{formatCount(leftScore)} battle taps</small></span></span></div>
      <span className={styles.vs}>VS</span>
      <div className={`${styles.team} ${styles.teamRight}`}><span className={styles.identity}><span><b>{countryName(right)}</b><small>{formatCount(rightScore)} battle taps</small></span><span className={styles.flag}>{flag(right)}</span></span></div>
    </div>
    <div className={styles.track} aria-label={`${countryName(left)} versus ${countryName(right)}`}>
      <span className={styles.leftTeam} style={{ width: `${leftWidth}%` }} />
      <span className={styles.rightTeam} style={{ width: `${100 - leftWidth}%` }} />
    </div>
  </section>;
}
