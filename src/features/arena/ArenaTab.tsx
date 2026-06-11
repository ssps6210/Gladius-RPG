import { useEffect, useState } from "react";

import { getRarity } from "../../game/systems";
import { useLanguage } from "../../game/i18n/LanguageContext";
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
  const { t, tr, L } = useLanguage();
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
      <div style={{
        position: "relative", width: "100%", height: 140, marginBottom: 16,
        borderRadius: 6, overflow: "hidden", border: "1px solid #3a2410",
      }}>
        <img src="./portraits/Arena.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(10,7,3,0.92) 100%)" }} />
        <div style={{ position: "absolute", bottom: 12, left: 16, fontFamily: "'Cinzel',serif", fontSize: 18, color: "#e8c050", letterSpacing: 3, textShadow: "0 0 20px rgba(200,150,30,0.6)" }}>
          🏟 {t("arenaTitle")}
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#5a4020", marginBottom: 14, fontStyle: "italic", lineHeight: 1.8 }}>
        {t("arenaDesc1")}<br />
        <span style={{ color: "#c84040" }}>{t("arenaDesc2")}</span>
      </div>

      {injured && (
        <div className="arena-injury">
          <div style={{ fontSize: 28, marginBottom: 8 }}>🛌</div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, color: "#c84040", marginBottom: 6 }}>{t("arenaInjTitle")}</div>
          <div style={{ fontSize: 13, color: "#8a4030", marginBottom: 12 }}>{t("arenaInjSub")}</div>
          <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 22, color: "#c84040" }}>
            {String(injuredMins).padStart(2, "0")}:{String(injuredSecs).padStart(2, "0")}
          </div>
          <div style={{ fontSize: 11, color: "#6a3020", marginTop: 4 }}>{t("arenaRestTime")}</div>
        </div>
      )}

      <div className="arena-refresh-bar">
        <div style={{ color: "#8a7050" }}>
          {L("今日免費刷新：", "Free refreshes: ", "今日免费刷新：")}<span style={{ color: "#c8961e", fontFamily: "'Cinzel',serif" }}>{arenaRefreshes}</span>/5{t("arenaFreeLeft")}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btp" style={{ fontSize: 10, padding: "5px 12px" }}
            onClick={() => onRefresh(true)} disabled={arenaRefreshes <= 0}>
            {t("arenaFreeRefresh")}
          </button>
          <button className="btn btm" style={{ fontSize: 10, padding: "5px 12px" }}
            onClick={() => onRefresh(false)}>
            {L(`🪙 花費 ${50 + player.level * 10} 刷新`, `🪙 Refresh for ${50 + player.level * 10}`, `🪙 花费 ${50 + player.level * 10} 刷新`)}
          </button>
        </div>
      </div>

      {arenaOpponents.length === 0 && !injured && (
        <div style={{ textAlign: "center", padding: "30px", color: "#5a4020", fontStyle: "italic" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🏟</div>
          {t("arenaEmpty")}
          <div style={{ marginTop: 12 }}>
            <button className="btn btp" style={{ fontSize: 11 }} onClick={() => onRefresh(true)} disabled={arenaRefreshes <= 0}>
              {t("arenaFind")}
            </button>
          </div>
        </div>
      )}

      <div className="arena-grid">
        {arenaOpponents.map(opp => {
          const tierLabel = opp.tier === "weak" ? t("arenaWeak") : opp.tier === "strong" ? t("arenaStrong") : t("arenaNormal");
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
              <div className="ac-name">{tr(opp, "name")}</div>
              <div className="ac-lvl">Lv.{opp.level} · {opp.wins}{t("arenaWins")} {opp.losses}{t("arenaLosses")}</div>
              <div className="ac-stats">
                <div><span style={{ color: "#c8781e" }}>{L("攻", "ATK")} {opp.attack}</span> · <span style={{ color: "#4a9fd4" }}>{L("防", "DEF")} {opp.defense}</span></div>
                <div><span style={{ color: "#c84040" }}>HP {opp.maxHp}</span></div>
                <div style={{ color: "#f0c040", marginTop: 4 }}>💰 {t("arenaCarries")} ~{opp.goldCarried}</div>
                <div style={{ color: "#4caf50", fontSize: 10 }}>{t("arenaPlunder")} ~{plunderEst}</div>
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 3, flexWrap: "wrap", minHeight: 22 }}>
                {Object.entries(opp.equipment).map(([slot, eq]) => {
                  const item = eq as any;
                  if (!item) return null;
                  const r = getRarity(item.rarity);
                  return (
                    <span key={slot} title={tr(item, "name")}
                      style={{ fontSize: 13, filter: `drop-shadow(0 1px 3px ${r.color}88)` }}>
                      {item.icon}
                    </span>
                  );
                })}
              </div>
              <button className="btn btp" style={{ width: "100%", marginTop: 10, fontSize: 11 }}
                disabled={!canFight}
                onClick={e => { e.stopPropagation(); canFight && onFight(opp); }}>
                {canFight ? t("arenaChallenge") : t("arenaResting")}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, padding: "10px 14px", background: "#0e0a06", border: "1px solid #2a1a08", borderRadius: 5, fontSize: 11, color: "#4a3820", lineHeight: 1.9 }}>
        <div style={{ color: "#6a5030", fontFamily: "'Cinzel',serif", marginBottom: 4 }}>{t("arenaRulesTitle")}</div>
        🟢 <span style={{ color: "#4caf50" }}>{t("arenaWeak")}</span> {t("arenaWeakDesc")}<br />
        🔵 <span style={{ color: "#4a9fd4" }}>{t("arenaNormal")}</span> {t("arenaNormDesc")}<br />
        🟠 <span style={{ color: "#e07020" }}>{t("arenaStrong")}</span> {t("arenaStrongDesc")}<br />
        {L("每天 5 次免費刷新，或花費金幣額外刷新。敗北休息 30 分鐘。", "5 free refreshes daily, or pay gold for more. Defeat = 30 min rest.", "每天 5 次免费刷新，或花费金币额外刷新。败北休息 30 分钟。")}
      </div>
    </div>
  );
}
