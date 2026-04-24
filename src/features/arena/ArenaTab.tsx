import { useEffect, useState } from "react";

import { getRarity } from "../../game/systems";
import type { GameArenaOpponent, GamePlayer } from "../../game/appTypes";

export function ArenaTab({ player, arenaOpponents, arenaInjuredUntil, arenaRefreshes, onRefresh, onFight, onInit }: {
  player: GamePlayer;
  arenaOpponents: GameArenaOpponent[];
  arenaInjuredUntil: number;
  arenaRefreshes: number;
  onRefresh: (free: boolean) => void;
  onFight: (opponent: GameArenaOpponent) => void;
  onInit: () => void;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (now >= arenaInjuredUntil) return;
    const t = setTimeout(() => setNow(Date.now()), 1000);
    return () => clearTimeout(t);
  }, [now, arenaInjuredUntil]);

  const injured = now < arenaInjuredUntil;
  const remaining = Math.max(0, arenaInjuredUntil - now);
  const injuredMins = Math.floor(remaining / 60000);
  const injuredSecs = Math.floor((remaining % 60000) / 1000);

  return (
    <div>
      <div className="stl">🏟 競技場 <span style={{ color: "#6a5030", fontSize: 13 }}>— 挑戰對手掠奪金幣</span></div>
      <div style={{ fontSize: 12, color: "#5a4020", marginBottom: 14, fontStyle: "italic", lineHeight: 1.8 }}>
        挑戰隨機對手，勝利可掠奪對方金幣（10-25%）。<br />
        <span style={{ color: "#c84040" }}>敗北則受傷休息 30 分鐘，且損失金幣。</span>
      </div>

      {injured && (
        <div className="arena-injury">
          <div style={{ fontSize: 28, marginBottom: 8 }}>🛌</div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, color: "#c84040", marginBottom: 6 }}>正在養傷中</div>
          <div style={{ fontSize: 13, color: "#8a4030", marginBottom: 12 }}>上次競技場落敗，需要休息才能再次出戰</div>
          <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 22, color: "#c84040" }}>
            {String(injuredMins).padStart(2, "0")}:{String(injuredSecs).padStart(2, "0")}
          </div>
          <div style={{ fontSize: 11, color: "#6a3020", marginTop: 4 }}>剩餘休息時間</div>
        </div>
      )}

      <div className="arena-refresh-bar">
        <div style={{ color: "#8a7050" }}>
          今日免費刷新：<span style={{ color: "#c8961e", fontFamily: "'Cinzel',serif" }}>{arenaRefreshes}</span>/5 次剩餘
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btp" style={{ fontSize: 10, padding: "5px 12px" }}
            onClick={() => onRefresh(true)} disabled={arenaRefreshes <= 0}>
            🔄 免費刷新
          </button>
          <button className="btn btm" style={{ fontSize: 10, padding: "5px 12px" }}
            onClick={() => onRefresh(false)}>
            🪙 花費 {50 + player.level * 10} 刷新
          </button>
        </div>
      </div>

      {arenaOpponents.length === 0 && !injured && (
        <div style={{ textAlign: "center", padding: "30px", color: "#5a4020", fontStyle: "italic" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🏟</div>
          點擊「免費刷新」開始尋找對手
          <div style={{ marginTop: 12 }}>
            <button className="btn btp" style={{ fontSize: 11 }} onClick={() => onRefresh(true)} disabled={arenaRefreshes <= 0}>
              🔄 尋找對手
            </button>
          </div>
        </div>
      )}

      <div className="arena-grid">
        {arenaOpponents.map(opp => {
          const tierLabel = opp.tier === "weak" ? "較弱" : opp.tier === "strong" ? "較強" : "相當";
          const tierColor = opp.tier === "weak" ? "#4caf50" : opp.tier === "strong" ? "#e07020" : "#4a9fd4";
          const plunderEst = Math.floor(opp.goldCarried * 0.175);
          const canFight = !injured;
          return (
            <div key={opp.id} className={`arena-card ${opp.tier}`}
              style={{ opacity: canFight ? 1 : 0.5, cursor: canFight ? "pointer" : "not-allowed" }}
              onClick={() => canFight && onFight(opp)}>
              <div className="ac-tier">{tierLabel}</div>
              <div style={{ fontSize: 28, marginBottom: 6, filter: `drop-shadow(0 2px 8px ${tierColor}66)` }}>
                {opp.tier === "strong" ? "😤" : opp.tier === "weak" ? "😰" : "😐"}
              </div>
              <div className="ac-name">{opp.name}</div>
              <div className="ac-lvl">Lv.{opp.level} · {opp.wins}勝 {opp.losses}敗</div>
              <div className="ac-stats">
                <div><span style={{ color: "#c8781e" }}>攻 {opp.attack}</span> · <span style={{ color: "#4a9fd4" }}>防 {opp.defense}</span></div>
                <div><span style={{ color: "#c84040" }}>HP {opp.maxHp}</span></div>
                <div style={{ color: "#f0c040", marginTop: 4 }}>💰 攜帶 ~{opp.goldCarried} 金</div>
                <div style={{ color: "#4caf50", fontSize: 10 }}>預估掠奪 ~{plunderEst} 金</div>
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 3, flexWrap: "wrap", minHeight: 22 }}>
                {Object.entries(opp.equipment).map(([slot, eq]) => {
                  const item = eq as any;
                  if (!item) return null;
                  const r = getRarity(item.rarity);
                  return (
                    <span key={slot} title={item.name}
                      style={{ fontSize: 13, filter: `drop-shadow(0 1px 3px ${r.color}88)` }}>
                      {item.icon}
                    </span>
                  );
                })}
              </div>
              <button className="btn btp" style={{ width: "100%", marginTop: 10, fontSize: 11 }}
                disabled={!canFight}
                onClick={e => { e.stopPropagation(); canFight && onFight(opp); }}>
                {canFight ? "⚔ 挑戰！" : "🛌 休息中"}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, padding: "10px 14px", background: "#0e0a06", border: "1px solid #2a1a08", borderRadius: 5, fontSize: 11, color: "#4a3820", lineHeight: 1.9 }}>
        <div style={{ color: "#6a5030", fontFamily: "'Cinzel',serif", marginBottom: 4 }}>競技場規則</div>
        🟢 <span style={{ color: "#4caf50" }}>較弱</span> — 容易擊敗，掠奪金幣較少<br />
        🔵 <span style={{ color: "#4a9fd4" }}>相當</span> — 勝負各半，掠奪金幣適中<br />
        🟠 <span style={{ color: "#e07020" }}>較強</span> — 難以擊敗，掠奪金幣豐厚<br />
        每天 5 次免費刷新，或花費金幣額外刷新。敗北休息 30 分鐘。
      </div>
    </div>
  );
}
