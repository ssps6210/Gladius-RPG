import { useLanguage } from "../../game/i18n/LanguageContext";
import type { RecoveryState } from "../../game/types/recovery";

interface InnPanelProps {
  player: { hp: number; maxHp: number };
  recovery: RecoveryState;
  restCost: number;
  onRest: () => void;
}

export function InnPanel({ player, recovery, restCost, onRest }: InnPanelProps) {
  const { t, L } = useLanguage();
  const now = Date.now();
  const dungeonInjured = recovery.dungeonInjuredUntil > now;
  const arenaInjured = recovery.arenaInjuredUntil > now;
  const dungeonMinutes = dungeonInjured ? Math.ceil((recovery.dungeonInjuredUntil - now) / 60_000) : 0;
  const arenaMinutes = arenaInjured ? Math.ceil((recovery.arenaInjuredUntil - now) / 60_000) : 0;

  return (
    <div style={{ border: "1px solid #3a2a10", borderRadius: 6, padding: 12, marginBottom: 12, background: "rgba(0,0,0,0.18)" }}>
      <h3>{t("innTitle")}</h3>
      <p>
        HP：{player.hp} / {player.maxHp}
      </p>
      {dungeonInjured && <p>{L(`地下城受傷中，尚需約 ${dungeonMinutes} 分鐘`, `Dungeon injury — ~${dungeonMinutes} min left`, `地下城受伤中，尚需约 ${dungeonMinutes} 分钟`)}</p>}
      {arenaInjured && <p>{L(`競技場受傷中，尚需約 ${arenaMinutes} 分鐘`, `Arena injury — ~${arenaMinutes} min left`, `竞技场受伤中，尚需约 ${arenaMinutes} 分钟`)}</p>}
      <button className="btn btm" onClick={onRest}>{L(`🛏 住宿恢復 (-🪙${restCost})`, `🛏 Rest (-🪙${restCost})`, `🛏 住宿恢复 (-🪙${restCost})`)}</button>
    </div>
  );
}
