import { JOB_CLASS_LIST, type JobClass } from "../game/data/classes";
import { useLanguage } from "../game/i18n/LanguageContext";

export function ClassSelectModal({
  open,
  onChoose,
  currentClass,
}: {
  open: boolean;
  onChoose: (classId: string) => void;
  currentClass?: string;
}) {
  const { L } = useLanguage();
  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: "linear-gradient(160deg,#1a1208,#0e0a06)",
        border: "1px solid #5a3a10", borderRadius: 8,
        padding: 24, maxWidth: 480, width: "100%",
        boxShadow: "0 0 40px rgba(200,120,30,0.3)",
      }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, color: "#e0a830", textAlign: "center", marginBottom: 6 }}>
          {L("⚔ 轉職系統", "⚔ Class Change")}
        </div>
        <div style={{ fontSize: 11, color: "#6a5028", textAlign: "center", marginBottom: 16 }}>
          {currentClass
            ? L("你已選擇職業。再次選擇可更換（屬性加成會重新計算）", "You already have a class. Selecting again will change it.")
            : L("Lv.30 達成！請選擇你的轉職職業。選擇後可再次更換。", "Lv.30 reached! Choose your class. You can change it later.")}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {JOB_CLASS_LIST.map((cls: JobClass) => {
            const isActive = currentClass === cls.id;
            return (
              <button
                key={cls.id}
                onClick={() => onChoose(cls.id)}
                style={{
                  background: isActive ? "linear-gradient(160deg,#3a2a08,#1e1608)" : "linear-gradient(160deg,#1a1208,#0e0a06)",
                  border: `1px solid ${isActive ? "#c8901e" : "#3a2810"}`,
                  borderRadius: 6, padding: 0, cursor: "pointer",
                  textAlign: "left", transition: "all .2s", overflow: "hidden",
                  boxShadow: isActive ? "0 0 12px rgba(200,140,30,0.4)" : "none",
                }}
              >
                {cls.portrait ? (
                  <div style={{ position: "relative" }}>
                    <img
                      src={cls.portrait}
                      alt={cls.nameEn}
                      style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block", opacity: isActive ? 1 : 0.75 }}
                    />
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
                      padding: "16px 8px 8px",
                    }}>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: isActive ? "#e0a830" : "#c8a060" }}>
                        {cls.icon} {L(cls.name, cls.nameEn)}
                      </div>
                      <div style={{ fontSize: 9, color: "#9a8060", lineHeight: 1.4, marginTop: 2 }}>
                        {L(cls.desc, cls.descEn)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "12px 10px" }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{cls.icon}</div>
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
          })}
        </div>
        {currentClass && (
          <button
            onClick={() => onChoose("")}
            style={{
              marginTop: 12, width: "100%", background: "transparent",
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
