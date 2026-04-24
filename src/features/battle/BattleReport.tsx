import { BattleLog } from "../../components/BattleLog";
import { ReplayLog } from "../../components/ReplayLog";
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
  return (
    <div className="ba">
      {replay ? (
        <>
          <div className="btl">{replaySummary?.title}</div>

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

          <ReplayLog lines={replay.lines} cursor={replay.cursor} />

          {replaySummary?.showBattleSummary && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, color: "#5a4020", fontFamily: "'Cinzel',serif", letterSpacing: 1, marginBottom: 4, textAlign: "center" }}>
                戰鬥摘要
              </div>
              <BattleLog log={replay.lines} />
            </div>
          )}

          <div className="bact" style={{ marginTop: 12 }}>
            {replay.cursor < replay.lines.length ? (
              <button className="btn btm" onClick={onSkip}>
                ⏩ 跳過
              </button>
            ) : (
              <>
                <button className="btn btp" onClick={onRestart}>
                  {replaySummary?.actionLabel}
                </button>
                <button className="btn btm" onClick={onClose}>
                  ↩ 返回
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", color: "#5a4020", fontFamily: "'Cinzel',serif", fontSize: 13, marginTop: 40 }}>
          選擇副本出發！
        </div>
      )}
    </div>
  );
}
