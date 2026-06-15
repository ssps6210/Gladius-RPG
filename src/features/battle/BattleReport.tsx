import { useEffect, useState } from "react";
import { BattleLog } from "../../components/BattleLog";
import { ReplayLog } from "../../components/ReplayLog";
import { useLanguage } from "../../game/i18n/LanguageContext";
import type { GameReplay } from "../../game/appTypes";

type ReplaySummary = {
  actionLabel: string;
  progressBackground: string;
  progressWidth: string;
  showBattleSummary: boolean;
  statusText: string;
  title: string;
};

export function BattleReport({
  replay,
  replaySummary,
  onClose,
  onRestart,
  onSkip,
}: {
  replay: GameReplay | null;
  replaySummary: ReplaySummary | null;
  onClose: () => void;
  onRestart: () => void;
  onSkip: () => void;
}) {
  const { t, L } = useLanguage();
  const [quickMode, setQuickMode] = useState(false);

  useEffect(() => {
    if (quickMode && replay && replay.cursor < replay.lines.length) {
      onSkip();
    }
  }, [quickMode]); // only trigger on quickMode change

  return (
    <div className="ba">
      {replay ? (
        <>
          <div style={{
            position: "relative", width: "100%", height: 120, marginBottom: 14,
            borderRadius: 6, overflow: "hidden", border: "1px solid #3a2410",
          }}>
            <img src="./portraits/Battle_Log.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(10,7,3,0.92) 100%)" }} />
            <div style={{ position: "absolute", bottom: 10, left: 14, fontFamily: "'Cinzel',serif", fontSize: 16, color: "#e8c050", letterSpacing: 3, textShadow: "0 0 20px rgba(200,150,30,0.6)" }}>
              {replaySummary?.title}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: "#5a4020", fontFamily: "'Cinzel',serif", letterSpacing: 1, marginBottom: 4, textAlign: "center" }}>
              {replaySummary?.statusText}
            </div>
            <div className="bt" style={{ height: 5 }}>
              <div className="bf" style={{
                width: replaySummary?.progressWidth,
                background: replaySummary?.progressBackground,
              }} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button
              className="btn btm"
              style={{ fontSize: 10, padding: "6px 12px" }}
              onClick={() => setQuickMode(q => !q)}
            >
              {quickMode
                ? L("📜 詳細", "📜 Details", "📜 详细")
                : L("⚡ 速覽", "⚡ Quick", "⚡ 速览")}
            </button>
          </div>

          {quickMode ? (
            <div style={{ padding: "12px 14px", background: "#0c0a06", border: "1px solid #2a1a08", borderRadius: 5, marginBottom: 12, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>
                {replay.won ? "🏆" : "💀"}
              </div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, color: replay.won ? "#4caf50" : "#c84040" }}>
                {replay.won ? L("勝利！", "Victory!", "胜利！") : L("敗北...", "Defeated...", "败北...")}
              </div>
            </div>
          ) : (
            <ReplayLog lines={replay.lines} cursor={replay.cursor} />
          )}

          {(replaySummary?.showBattleSummary || quickMode) && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, color: "#5a4020", fontFamily: "'Cinzel',serif", letterSpacing: 1, marginBottom: 4, textAlign: "center" }}>
                {L("戰鬥摘要", "Battle Summary", "战斗摘要")}
              </div>
              <BattleLog log={replay.lines} />
            </div>
          )}

          <div className="bact" style={{ marginTop: 12 }}>
            <button
              className="btn btp"
              onClick={onRestart}
              style={{ visibility: replay.cursor < replay.lines.length ? "hidden" : undefined }}
            >
              {replaySummary?.actionLabel || "…"}
            </button>
            <button
              className="btn btm"
              onClick={replay.cursor < replay.lines.length ? onSkip : onClose}
            >
              {replay.cursor < replay.lines.length ? t("btnSkip") : t("btnReturn")}
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", color: "#5a4020", fontFamily: "'Cinzel',serif", fontSize: 13, marginTop: 40 }}>
          {t("btnChargeDun")}
        </div>
      )}
    </div>
  );
}
