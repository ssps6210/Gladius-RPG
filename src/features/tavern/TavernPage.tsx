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
      <h2>{t("tabTavern")}</h2>
      <InnPanel player={player} recovery={recovery} restCost={restCost} onRest={onRest} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ color: "#6a5030", fontSize: 12 }}>{t("tavernBoard")}：{board.length}{t("tavernQuests")}</div>
        <button className="btn btm" onClick={onRefresh}>{t("tavernRefresh")}</button>
      </div>

      {board.length === 0 && <div style={{ color: "#4a3a20", fontStyle: "italic" }}>{t("tavernEmpty")}</div>}

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
                  <div style={{ fontSize: 14, color: "#d9be6a" }}>{quest.icon} {tr(quest, "title")}</div>
                  <div style={{ fontSize: 12, color: "#8a7656", fontStyle: "italic", lineHeight: 1.6, margin: "6px 0", whiteSpace: "pre-line" }}>{tr(quest, "lore")}</div>
                  <div style={{ fontSize: 12, color: "#6a5030" }}>{L("需求", "Target")}：{monName(quest.targetMonster)} x{quest.reqCount}（Lv.{quest.reqLv}+）</div>
                  <div style={{ fontSize: 11, color: "#8b7650", marginTop: 4 }}>{tr(quest, "hint")}</div>
                  <div style={{ fontSize: 11, color: "#c8961e", marginTop: 4 }}>{L("獎勵", "Reward")}：🪙{quest.reward.gold} / ✨{quest.reward.exp} EXP</div>
                  {isAccepted && <div style={{ fontSize: 11, color: done ? "#4caf50" : "#6a5030", marginTop: 4 }}>{L("進度", "Progress")}：{Math.min(doneCount, quest.reqCount)} / {quest.reqCount}</div>}
                </div>
                {isActive && <div style={{ fontSize: 11, color: "#4caf50" }}>{L("進行中", "Active")}</div>}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <button className="btn btp" onClick={() => onAcceptQuest(quest.id)}>{t("tavernAccept")}</button>
                {isAccepted && <button className="btn btm" onClick={() => onAbandonQuest(quest.id)}>{t("tavernAbandon")}</button>}
                {isAccepted && done && <button className="btn btd" onClick={() => onClaimQuest(quest.id)}>{L("領取賞金", "Claim Bounty")}</button>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
