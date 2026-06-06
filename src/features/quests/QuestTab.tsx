import { useState } from "react";

import { QUEST_DEFS } from "../../game/data/quests";
import { getQuestProgress, isQuestDone } from "../../game/systems";
import { useLanguage } from "../../game/i18n/LanguageContext";
import type { GameItem, GamePlayer, GameQuestState } from "../../game/appTypes";

export function QuestTab({ player, inventory, questState, onCollect }: {
  player: GamePlayer;
  inventory: GameItem[];
  questState: GameQuestState;
  onCollect: (questId: string) => void;
}) {
  const { t, tr, L } = useLanguage();
  const [catTab, setCatTab] = useState("daily");
  const statsWithInv = { ...player, _inv: inventory };

  const cats = [
    { id: "daily", label: t("questDaily"), color: "#4caf50" },
    { id: "weekly", label: t("questWeekly"), color: "#4a9fd4" },
    { id: "achieve", label: t("questAchieve"), color: "#e07020" },
  ];

  const questsInCat = Object.entries(QUEST_DEFS).filter(([, d]) => d.cat === catTab);

  const completable = Object.entries(QUEST_DEFS).filter(([id]) =>
    isQuestDone(id, statsWithInv, questState)
  ).length;

  return (
    <div>
      <div style={{
        position: "relative", width: "100%", height: 140, marginBottom: 16,
        borderRadius: 6, overflow: "hidden", border: "1px solid #3a2410",
      }}>
        <img src="./portraits/Quest.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(10,7,3,0.92) 100%)" }} />
        <div style={{ position: "absolute", bottom: 12, left: 16, fontFamily: "'Cinzel',serif", fontSize: 18, color: "#e8c050", letterSpacing: 3, textShadow: "0 0 20px rgba(200,150,30,0.6)", display: "flex", alignItems: "center", gap: 8 }}>
          📋 {t("questTitle")}
          {completable > 0 && (
            <span style={{ background: "#c84040", color: "#fff", borderRadius: "10px", padding: "1px 7px", fontSize: 11, fontFamily: "sans-serif", letterSpacing: 0 }}>
              {completable}
            </span>
          )}
        </div>
      </div>
      <div className="quest-tabs">
        {cats.map(cat => {
          const catCompletable = Object.entries(QUEST_DEFS)
            .filter(([id, d]) => d.cat === cat.id && isQuestDone(id, statsWithInv, questState))
            .length;
          return (
            <button key={cat.id}
              className={`btn${catTab === cat.id ? " btp" : " btm"}`}
              style={{ fontSize: 11, padding: "6px 14px", position: "relative" }}
              onClick={() => setCatTab(cat.id)}>
              {cat.label}
              {catCompletable > 0 && (
                <span style={{ marginLeft: 5, background: "#c84040", color: "#fff",
                  borderRadius: "8px", padding: "0 5px", fontSize: 10 }}>
                  {catCompletable}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {catTab === "daily" && (
        <div style={{ fontSize: 11, color: "#4a3820", marginBottom: 10, fontStyle: "italic" }}>
          {t("questDailyReset")}（{questState.dailyDate}）
        </div>
      )}
      {catTab === "weekly" && (
        <div style={{ fontSize: 11, color: "#4a3820", marginBottom: 10, fontStyle: "italic" }}>
          {t("questWeeklyReset")}（{questState.weeklyDate}）
        </div>
      )}
      {catTab === "achieve" && (
        <div style={{ fontSize: 11, color: "#4a3820", marginBottom: 10, fontStyle: "italic" }}>
          {t("questAchieveDesc")}
        </div>
      )}

      <div className="quest-cat">
        {questsInCat.map(([id, def]) => {
          const collected = questState.progress[id] && questState.progress[id].collected;
          const done      = !collected && isQuestDone(id, statsWithInv, questState);
          const progress  = getQuestProgress(id, statsWithInv, questState);
          const pct       = Math.min(100, Math.round(progress / def.target * 100));
          const barColor  = done ? "#4caf50" : pct > 50 ? "#c8961e" : "#4a9fd4";

          return (
            <div key={id} className={`quest-card${collected ? " done" : done ? " collect" : ""}`}>
              <div className="quest-icon">{def.icon}</div>
              <div className="quest-body">
                <div className="quest-title">{tr(def, "title")}</div>
                <div className="quest-desc">{tr(def, "desc")}</div>
                {!collected && (
                  <>
                    <div className="quest-progress">
                      <div className="quest-pbar" style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                    <div className="quest-ptext">
                      {done ? t("questReady") : `${Math.min(progress, def.target)} / ${def.target}`}
                    </div>
                  </>
                )}
                {collected && (
                  <div className="quest-ptext" style={{ color: "#4caf50" }}>{t("questDone")}</div>
                )}
                <div className="quest-rewards">
                  {def.rewards.map((r: any, i: any) => (
                    <span key={i} className="quest-reward-badge">{tr(r, "label")}</span>
                  ))}
                </div>
              </div>
              <div className="quest-btn">
                {!collected && done && (
                  <button className="btn btp" style={{ fontSize: 10, padding: "6px 12px", whiteSpace: "nowrap" }}
                    onClick={() => onCollect(id)}>
                    {t("questCollect")}
                  </button>
                )}
                {collected && <div style={{ fontSize: 18 }}>✅</div>}
                {!collected && !done && (
                  <div style={{ fontSize: 11, color: "#4a3020", textAlign: "center" }}>{pct}%</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
