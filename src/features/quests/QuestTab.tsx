import { useState } from "react";

import { QUEST_DEFS } from "../../game/data/quests";
import { getQuestProgress, isQuestDone } from "../../game/systems";
import type { GameItem, GamePlayer, GameQuestState } from "../../game/appTypes";

export function QuestTab({ player, inventory, questState, onCollect }: {
  player: GamePlayer;
  inventory: GameItem[];
  questState: GameQuestState;
  onCollect: (questId: string) => void;
}) {
  const [catTab, setCatTab] = useState("daily");
  const statsWithInv = { ...player, _inv: inventory };

  const cats = [
    { id: "daily", label: "📅 每日", color: "#4caf50" },
    { id: "weekly", label: "📆 每週", color: "#4a9fd4" },
    { id: "achieve", label: "🏆 成就", color: "#e07020" },
  ];

  const questsInCat = Object.entries(QUEST_DEFS).filter(([, d]) => d.cat === catTab);

  const completable = Object.entries(QUEST_DEFS).filter(([id]) =>
    isQuestDone(id, statsWithInv, questState)
  ).length;

  return (
    <div>
      <div className="stl">
        📋 任務
        {completable > 0 && (
          <span style={{ marginLeft: 8, background: "#c84040", color: "#fff", borderRadius: "10px",
            padding: "1px 7px", fontSize: 11, fontFamily: "sans-serif" }}>
            {completable}
          </span>
        )}
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
          每日任務在午夜重置（{questState.dailyDate}）
        </div>
      )}
      {catTab === "weekly" && (
        <div style={{ fontSize: 11, color: "#4a3820", marginBottom: 10, fontStyle: "italic" }}>
          每週任務在週一重置（{questState.weeklyDate}）
        </div>
      )}
      {catTab === "achieve" && (
        <div style={{ fontSize: 11, color: "#4a3820", marginBottom: 10, fontStyle: "italic" }}>
          成就任務永不重置，完成後即鎖定
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
                <div className="quest-title">{def.title}</div>
                <div className="quest-desc">{def.desc}</div>
                {!collected && (
                  <>
                    <div className="quest-progress">
                      <div className="quest-pbar" style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                    <div className="quest-ptext">
                      {done ? "✅ 已完成，可領取！" : `${Math.min(progress, def.target)} / ${def.target}`}
                    </div>
                  </>
                )}
                {collected && (
                  <div className="quest-ptext" style={{ color: "#4caf50" }}>✓ 已領取</div>
                )}
                <div className="quest-rewards">
                  {def.rewards.map((r: any, i: any) => (
                    <span key={i} className="quest-reward-badge">{r.label}</span>
                  ))}
                </div>
              </div>
              <div className="quest-btn">
                {!collected && done && (
                  <button className="btn btp" style={{ fontSize: 10, padding: "6px 12px", whiteSpace: "nowrap" }}
                    onClick={() => onCollect(id)}>
                    領取！
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
