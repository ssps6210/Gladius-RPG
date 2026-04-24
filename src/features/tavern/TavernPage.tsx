import type { RecoveryState } from "../../game/types/recovery";
import type { TavernQuestBoardItem, TavernQuestState } from "../../game/types/tavern";
import { InnPanel } from "./InnPanel";

interface TavernPageProps {
  player: { hp: number; maxHp: number };
  recovery: RecoveryState;
  restCost: number;
  board: TavernQuestBoardItem[];
  activeQuestId: string | null;
  accepted: TavernQuestState["accepted"];
  progress: TavernQuestState["progress"];
  onRest: () => void;
  onRefresh: () => void;
  onAcceptQuest: (questId: string) => void;
  onClaimQuest: (questId: string) => void;
  onAbandonQuest: (questId: string) => void;
}

export function TavernPage({
  player,
  recovery,
  restCost,
  board,
  activeQuestId,
  accepted,
  progress,
  onRest,
  onRefresh,
  onAcceptQuest,
  onClaimQuest,
  onAbandonQuest,
}: TavernPageProps) {
  return (
    <section>
      <h2>🍺 酒館</h2>
      <InnPanel player={player} recovery={recovery} restCost={restCost} onRest={onRest} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ color: "#6a5030", fontSize: 12 }}>告示板委託：{board.length} 項</div>
        <button className="btn btm" onClick={onRefresh}>🔄 刷新告示板</button>
      </div>

      {board.length === 0 && <div style={{ color: "#4a3a20", fontStyle: "italic" }}>今天沒有新的酒館委託</div>}

      <div style={{ display: "grid", gap: 10 }}>
        {board.map((quest) => {
          const acceptedState = accepted[quest.id];
          const isAccepted = !!acceptedState?.accepted;
          const currentKills = progress[quest.targetMonster] ?? 0;
          const baseKills = acceptedState?.baseKills ?? 0;
          const doneCount = Math.max(0, currentKills - baseKills);
          const done = doneCount >= quest.reqCount;
          const isActive = activeQuestId === quest.id;

          return (
            <article key={quest.id} style={{ border: "1px solid #3a2a10", borderRadius: 6, padding: 10, background: "rgba(0,0,0,0.16)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 14, color: "#d9be6a" }}>{quest.icon} {quest.title}</div>
                  <div style={{ fontSize: 12, color: "#6a5030" }}>需求：{quest.targetMonster} x{quest.reqCount}（Lv.{quest.reqLv}+）</div>
                  <div style={{ fontSize: 11, color: "#8b7650", marginTop: 4 }}>{quest.hint}</div>
                  <div style={{ fontSize: 11, color: "#c8961e", marginTop: 4 }}>獎勵：🪙{quest.reward.gold} / ✨{quest.reward.exp} EXP</div>
                  {isAccepted && <div style={{ fontSize: 11, color: done ? "#4caf50" : "#6a5030", marginTop: 4 }}>進度：{Math.min(doneCount, quest.reqCount)} / {quest.reqCount}</div>}
                </div>
                {isActive && <div style={{ fontSize: 11, color: "#4caf50" }}>進行中</div>}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <button className="btn btp" onClick={() => onAcceptQuest(quest.id)}>接取任務</button>
                {isAccepted && <button className="btn btm" onClick={() => onAbandonQuest(quest.id)}>放棄</button>}
                {isAccepted && done && <button className="btn btd" onClick={() => onClaimQuest(quest.id)}>領取賞金</button>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
