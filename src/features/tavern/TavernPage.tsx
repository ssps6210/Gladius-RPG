import { MONSTERS } from "../../game/data/monsters";
import { useLanguage } from "../../game/i18n/LanguageContext";
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
  const { t, tr, L } = useLanguage();
  const monName = (key: string) => (MONSTERS[key] ? tr(MONSTERS[key], "name") : key);
  return (
    <section>
      <div style={{
        position: "relative", width: "100%", height: 140, marginBottom: 16,
        borderRadius: 6, overflow: "hidden", border: "1px solid #3a2410",
      }}>
        <img src="./portraits/Tavern_people.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(10,7,3,0.92) 100%)" }} />
        <div style={{ position: "absolute", bottom: 12, left: 16, fontFamily: "'Cinzel',serif", fontSize: 18, color: "#e8c050", letterSpacing: 3, textShadow: "0 0 20px rgba(200,150,30,0.6)" }}>
          🍺 {t("tabTavern")}
        </div>
      </div>
      <InnPanel player={player} recovery={recovery} restCost={restCost} onRest={onRest} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ color: "#6a5030", fontSize: 12 }}>{t("tavernBoard")}：{board.length}{t("tavernQuests")}</div>
        <button className="btn btm" onClick={onRefresh}>{t("tavernRefresh")}</button>
      </div>

      {board.length === 0 && <div style={{ color: "#4a3a20", fontStyle: "italic" }}>{t("tavernEmpty")}</div>}

      <div style={{ display: "grid", gap: 14 }}>
        {board.map((quest) => {
          const acceptedState = accepted[quest.id];
          const isAccepted = !!acceptedState?.accepted && !acceptedState?.concluded;
          const currentKills = progress[quest.targetMonster] ?? 0;
          const baseKills = isAccepted ? (acceptedState?.baseKills ?? 0) : 0;
          const doneCount = Math.max(0, currentKills - baseKills);
          const done = doneCount >= quest.reqCount;
          const isActive = activeQuestId === quest.id;

          return (
            <article key={quest.id} style={{
              border: `1px solid ${done ? "#6a4010" : "#5a3a18"}`,
              borderLeft: `3px solid ${done ? "#c8961e" : "#4a2e12"}`,
              borderRadius: 3,
              padding: "12px 14px",
              background: "linear-gradient(160deg, #241808 0%, #1c1206 60%, #201508 100%)",
              backgroundImage: "linear-gradient(160deg, #241808 0%, #1c1206 60%, #201508 100%), repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(139,90,20,0.04) 19px, rgba(139,90,20,0.04) 20px)",
              position: "relative",
              boxShadow: done ? "0 0 12px rgba(200,150,30,0.15), inset 0 1px 0 rgba(200,150,30,0.05)" : "none",
            }}>
              {/* Wax seal area */}
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: done ? "#e8c050" : "#c8a050", letterSpacing: 1, marginBottom: 6 }}>
                    {quest.icon} {tr(quest, "title")}
                  </div>
                  <div style={{ fontSize: 12, color: "#7a6648", fontStyle: "italic", lineHeight: 1.7, marginBottom: 8, whiteSpace: "pre-line", fontFamily: "'Crimson Text', serif" }}>{tr(quest, "lore")}</div>
                  <div style={{ height: 1, background: "linear-gradient(90deg, rgba(90,58,24,0.5), transparent)", marginBottom: 8 }} />
                  <div style={{ fontSize: 11, color: "#6a5030", marginBottom: 3 }}>{L("目標", "Target")}：{monName(quest.targetMonster)} ×{quest.reqCount}　Lv.{quest.reqLv}+</div>
                  <div style={{ fontSize: 11, color: "#8b7650", marginBottom: 3, fontStyle: "italic" }}>{tr(quest, "hint")}</div>
                  <div style={{ fontSize: 11, color: "#c8961e", marginBottom: isAccepted ? 3 : 0 }}>
                    {L("賞金", "Reward", "赏金")}：🪙{quest.reward.gold} · ✨{quest.reward.exp} EXP
                  </div>
                  {isAccepted && (
                    <div style={{ fontSize: 11, color: done ? "#50c870" : "#6a5030", fontFamily: "'Cinzel', serif" }}>
                      {done ? "✓ " : ""}{L("進度", "Progress", "进度")}：{Math.min(doneCount, quest.reqCount)} / {quest.reqCount}
                    </div>
                  )}
                </div>
                {isActive && !done && (
                  <div style={{
                    fontSize: 9, color: "#c8961e", fontFamily: "'Cinzel', serif",
                    border: "1px solid #5a3a10", borderRadius: 2,
                    padding: "2px 6px", letterSpacing: 1, whiteSpace: "nowrap",
                  }}>{L("進行中", "ACTIVE", "进行中")}</div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {!isAccepted && <button className="btn btp" disabled={!!activeQuestId} onClick={() => onAcceptQuest(quest.id)}>{t("tavernAccept")}</button>}
                {isAccepted && !done && <button className="btn btm" onClick={() => onAbandonQuest(quest.id)}>{t("tavernAbandon")}</button>}
                {isAccepted && done && <button className="btn btd" style={{ letterSpacing: 1 }} onClick={() => onClaimQuest(quest.id)}>{L("領取賞金", "Claim Bounty", "领取赏金")}</button>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
