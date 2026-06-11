import { useLanguage } from "../../game/i18n/LanguageContext";
import type { StoryRewardState } from "../../game/types/tavern";

interface StoryModalProps {
  story: StoryRewardState;
  onDismiss?: () => void;
}

export function StoryModal({ story, onDismiss }: StoryModalProps) {
  const { t, tr, L } = useLanguage();
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(0,0,0,0.88)",
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(3px)",
    }}>
      <div style={{
        maxWidth: 460, width: "90vw",
        background: "linear-gradient(160deg, #2c1e0a 0%, #1e1408 50%, #261a08 100%)",
        border: "2px solid #8b5a14",
        borderRadius: 6,
        padding: "32px 28px 28px",
        boxShadow: "0 0 60px rgba(139,90,20,0.35), inset 0 1px 0 rgba(232,192,80,0.12)",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", inset: 6,
          border: "1px solid rgba(139,90,20,0.25)",
          borderRadius: 3, pointerEvents: "none",
        }} />

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 4,
            color: "#8b5a14", textTransform: "uppercase" as const, marginBottom: 14,
          }}>
            ✦ {L("懸賞完成", "BOUNTY COMPLETE", "悬赏完成")} ✦
          </div>
          <div style={{ fontSize: 44, marginBottom: 10, filter: "drop-shadow(0 0 12px rgba(200,150,30,0.5))" }}>
            {story.icon}
          </div>
          <div style={{
            fontFamily: "'Cinzel', serif", fontSize: 17, color: "#e8c050",
            letterSpacing: 2, textShadow: "0 0 20px rgba(200,150,30,0.4)",
          }}>
            {tr(story, "title")}
          </div>
        </div>

        <div style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, #6a4010, #c8961e, #6a4010, transparent)",
          marginBottom: 18,
        }} />

        <div style={{
          background: "rgba(0,0,0,0.25)",
          border: "1px solid #3a2a10",
          borderRadius: 3,
          padding: "14px 16px",
          marginBottom: 20,
          fontFamily: "'Crimson Text', serif",
          fontSize: 15,
          lineHeight: 1.85,
          color: "#c8a878",
          fontStyle: "italic",
        }}>
          {tr(story, "conclusion")}
        </div>

        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{
            display: "inline-block",
            background: "rgba(139,90,20,0.12)",
            border: "1px solid #5a3a10",
            borderRadius: 3,
            padding: "7px 20px",
            fontFamily: "'Cinzel', serif",
            fontSize: 13,
            color: "#e8c050",
            letterSpacing: 1,
          }}>
            🪙 {story.reward.gold} {L("金幣", "Gold", "金币")} &nbsp;·&nbsp; ✨ {story.reward.exp} EXP
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button className="btn btp" style={{ padding: "10px 32px", letterSpacing: 2, fontSize: 11 }} onClick={onDismiss}>
            {t("tavernLeave")}
          </button>
        </div>
      </div>
    </div>
  );
}
