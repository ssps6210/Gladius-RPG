import { JOB_CLASSES, TIER1_CLASSES, TIER2_CLASSES, type JobClass } from "../game/data/classes";
import { useLanguage } from "../game/i18n/LanguageContext";

function getLineage(classId: string): string {
  const cls = JOB_CLASSES[classId as keyof typeof JOB_CLASSES];
  return cls?.prereq ?? classId;
}

function isUnlocked(cls: JobClass, playerLevel: number, currentClass: string | undefined): boolean {
  if (cls.tier === 1) return playerLevel >= cls.reqLevel;
  if (playerLevel < cls.reqLevel) return false;
  const lineage = getLineage(currentClass ?? "");
  return lineage === cls.prereq;
}

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
      key={cls.id}
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
              {locked
                ? L(`需要先轉職為 ${JOB_CLASSES[cls.prereq!]?.name ?? cls.prereq}`, `Requires ${JOB_CLASSES[cls.prereq!]?.nameEn ?? cls.prereq} first`)
                : L(cls.desc, cls.descEn)}
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
            {locked
              ? L(`需要先轉職為 ${JOB_CLASSES[cls.prereq!]?.name ?? cls.prereq}`, `Requires ${JOB_CLASSES[cls.prereq!]?.nameEn ?? cls.prereq}`)
              : L(cls.desc, cls.descEn)}
          </div>
        </div>
      )}
    </button>
  );
}

export function ClassSelectModal({
  open,
  onChoose,
  currentClass,
  playerLevel = 30,
}: {
  open: boolean;
  onChoose: (classId: string) => void;
  currentClass?: string;
  playerLevel?: number;
}) {
  const { L } = useLanguage();
  if (!open) return null;

  const isTier2Eligible = playerLevel >= 70;
  const subtitle = currentClass
    ? L("你已有職業。選擇新職業可更換（屬性加成重新計算）", "You have a class. Select a new one to change it.")
    : isTier2Eligible
      ? L("Lv.70 達成！可轉職為強力的二轉職業！", "Lv.70 reached! Upgrade to a powerful Tier 2 class!")
      : L("Lv.30 達成！請選擇你的轉職職業。", "Lv.30 reached! Choose your first class.");

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16, overflowY: "auto",
    }}>
      <div style={{
        background: "linear-gradient(160deg,#1a1208,#0e0a06)",
        border: "1px solid #5a3a10", borderRadius: 8,
        padding: 24, maxWidth: 520, width: "100%",
        boxShadow: "0 0 40px rgba(200,120,30,0.3)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, color: "#e0a830", textAlign: "center", marginBottom: 6 }}>
          {L("⚔ 轉職系統", "⚔ Class Change")}
        </div>
        <div style={{ fontSize: 11, color: "#6a5028", textAlign: "center", marginBottom: 20 }}>
          {subtitle}
        </div>

        {/* Tier 1 */}
        <div style={{ fontSize: 11, color: "#8a6030", fontFamily: "'Cinzel',serif", marginBottom: 8, borderBottom: "1px solid #2a1e10", paddingBottom: 4 }}>
          {L("一轉職業 — Lv.30", "Tier 1 Classes — Lv.30")}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {TIER1_CLASSES.map((cls) => (
            <ClassCard
              key={cls.id}
              cls={cls}
              isActive={currentClass === cls.id}
              locked={false}
              onChoose={onChoose}
              L={L}
            />
          ))}
        </div>

        {/* Tier 2 */}
        <div style={{ fontSize: 11, color: isTier2Eligible ? "#e0a830" : "#4a3820", fontFamily: "'Cinzel',serif", marginBottom: 8, borderBottom: "1px solid #2a1e10", paddingBottom: 4 }}>
          {L("二轉職業 — Lv.70", "Tier 2 Classes — Lv.70")}
          {!isTier2Eligible && (
            <span style={{ fontSize: 10, color: "#4a3020", marginLeft: 8 }}>
              {L(`（尚需 ${70 - playerLevel} 級）`, `(${70 - playerLevel} levels away)`)}
            </span>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {TIER2_CLASSES.map((cls) => (
            <ClassCard
              key={cls.id}
              cls={cls}
              isActive={currentClass === cls.id}
              locked={!isUnlocked(cls, playerLevel, currentClass)}
              onChoose={onChoose}
              L={L}
            />
          ))}
        </div>

        {currentClass && (
          <button
            onClick={() => onChoose("")}
            style={{
              marginTop: 14, width: "100%", background: "transparent",
              border: "1px solid #3a2810", borderRadius: 4, padding: "6px 0",
              color: "#5a4020", fontSize: 10, cursor: "pointer",
            }}
          >
            {L("取消 / 維持現有職業", "Cancel / Keep current class")}
          </button>
        )}
      </div>
    </div>
  );
}
