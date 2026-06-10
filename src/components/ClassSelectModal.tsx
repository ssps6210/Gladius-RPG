import { JOB_CLASSES, TIER1_CLASSES, TIER2_CLASSES, type JobClass } from "../game/data/classes";
import { useLanguage } from "../game/i18n/LanguageContext";

function ClassCard({
  cls, isActive, locked, onChoose, L,
}: {
  cls: JobClass;
  isActive: boolean;
  locked: boolean;
  onChoose: (id: string) => void;
  L: (zh: string, en: string) => string;
}) {
  return (
    <button
      onClick={() => !locked && onChoose(cls.id)}
      style={{
        background: isActive
          ? "linear-gradient(160deg,#3a2a08,#1e1608)"
          : locked
            ? "linear-gradient(160deg,#141010,#0a0808)"
            : "linear-gradient(160deg,#1a1208,#0e0a06)",
        border: `1px solid ${isActive ? "#c8901e" : locked ? "#2a1e18" : "#3a2810"}`,
        borderRadius: 6, padding: 0,
        cursor: locked ? "not-allowed" : "pointer",
        textAlign: "left", transition: "all .2s", overflow: "hidden",
        boxShadow: isActive ? "0 0 12px rgba(200,140,30,0.4)" : "none",
        opacity: locked ? 0.45 : 1,
      }}
    >
      {cls.portrait ? (
        <div style={{ position: "relative" }}>
          <img
            src={cls.portrait}
            alt={cls.nameEn}
            style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block", opacity: isActive ? 1 : 0.75 }}
          />
          {locked && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.5)", fontSize: 28,
            }}>🔒</div>
          )}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
            padding: "16px 8px 8px",
          }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: isActive ? "#e0a830" : locked ? "#4a3820" : "#c8a060" }}>
              {cls.icon} {L(cls.name, cls.nameEn)}
            </div>
            <div style={{ fontSize: 9, color: locked ? "#3a2818" : "#9a8060", lineHeight: 1.4, marginTop: 2 }}>
              {L(cls.desc, cls.descEn)}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: "12px 10px" }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>{locked ? "🔒" : cls.icon}</div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: isActive ? "#e0a830" : "#c8a060", marginBottom: 3 }}>
            {L(cls.name, cls.nameEn)}
          </div>
          <div style={{ fontSize: 10, color: "#7a6040", lineHeight: 1.5 }}>
            {L(cls.desc, cls.descEn)}
          </div>
        </div>
      )}
    </button>
  );
}

export function ClassSelectModal({
  open,
  onChoose,
  onCancel,
  currentClass,
  playerLevel = 1,
}: {
  open: boolean;
  onChoose: (classId: string) => void;
  onCancel?: () => void;
  currentClass?: string;
  playerLevel?: number;
}) {
  const { L } = useLanguage();
  if (!open) return null;

  const currentCls = JOB_CLASSES[currentClass as keyof typeof JOB_CLASSES];
  const isTier1 = currentCls?.tier === 1;
  const isTier2 = currentCls?.tier === 2;

  // Tier-2 holders: nothing actionable — don't show
  if (isTier2) return null;

  // Phase A: No class yet — choose Tier-1 path permanently
  if (!currentClass || currentClass === "") {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 16, overflowY: "auto",
      }}>
        <div style={{
          background: "linear-gradient(160deg,#1a1208,#0e0a06)",
          border: "1px solid #5a3a10", borderRadius: 8,
          padding: 24, maxWidth: 480, width: "100%",
          boxShadow: "0 0 40px rgba(200,120,30,0.3)",
          maxHeight: "90vh", overflowY: "auto",
        }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, color: "#e0a830", textAlign: "center", marginBottom: 6 }}>
            {L("⚔ 選擇你的命運", "⚔ Choose Your Path")}
          </div>
          <div style={{ fontSize: 11, color: "#9a7030", textAlign: "center", marginBottom: 8 }}>
            {L("Lv.30 解鎖！請選擇一轉職業。", "Lv.30 reached! Choose your Tier 1 class.")}
          </div>
          <div style={{
            fontSize: 10, color: "#c84040", textAlign: "center",
            background: "rgba(200,60,40,0.1)", border: "1px solid rgba(200,60,40,0.25)",
            borderRadius: 4, padding: "8px 12px", marginBottom: 20,
          }}>
            ⚠ {L("此選擇永久鎖定！路徑一旦確認，只能沿此路晉升二轉，或重新打檔更換。", "This choice is PERMANENT. You can only advance along this lineage, or restart to change.")}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {TIER1_CLASSES.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                isActive={false}
                locked={playerLevel < cls.reqLevel}
                onChoose={onChoose}
                L={L}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Phase B: Has Tier-1 — can advance to matching Tier-2 (Lv.70)
  if (isTier1) {
    const matchingTier2 = TIER2_CLASSES.filter(c => c.prereq === currentClass);
    const canAdvance = playerLevel >= 70;

    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 16, overflowY: "auto",
      }}>
        <div style={{
          background: "linear-gradient(160deg,#1a1208,#0e0a06)",
          border: "1px solid #5a3a10", borderRadius: 8,
          padding: 24, maxWidth: 480, width: "100%",
          boxShadow: "0 0 40px rgba(200,120,30,0.3)",
          maxHeight: "90vh", overflowY: "auto",
        }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, color: "#e0a830", textAlign: "center", marginBottom: 6 }}>
            {L("⚔ 二轉晉升", "⚔ Tier 2 Advancement")}
          </div>
          <div style={{ fontSize: 11, color: "#9a7030", textAlign: "center", marginBottom: 8 }}>
            {currentCls.icon} {L(currentCls.name, currentCls.nameEn)} →{" "}
            {canAdvance
              ? L("選擇晉升職業", "Choose advancement")
              : L(`尚需 ${70 - playerLevel} 級可晉升`, `Need ${70 - playerLevel} more levels`)}
          </div>
          <div style={{
            fontSize: 10, color: "#c8a040", textAlign: "center",
            background: "rgba(200,140,40,0.08)", border: "1px solid rgba(200,140,40,0.2)",
            borderRadius: 4, padding: "8px 12px", marginBottom: 20,
          }}>
            🔒 {L(`路徑已鎖定：只有此職業的晉升路線可選。`, `Path locked: only this lineage's Tier 2 options are available.`)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {matchingTier2.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                isActive={false}
                locked={!canAdvance}
                onChoose={onChoose}
                L={L}
              />
            ))}
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                marginTop: 14, width: "100%", background: "transparent",
                border: "1px solid #3a2810", borderRadius: 4, padding: "6px 0",
                color: "#5a4020", fontSize: 10, cursor: "pointer",
              }}
            >
              {L("取消", "Cancel")}
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
