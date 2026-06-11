import { useState } from "react";
import { useLanguage } from "../game/i18n/LanguageContext";
import { JOB_CLASSES } from "../game/data/classes";
import { clearGameState, getSlotPreview, type SlotPreview } from "../game/persistence";
import type { SaveSlot } from "../game/constants/storage";

const SLOTS: SaveSlot[] = [1, 2, 3];

function SlotCard({
  slot,
  preview,
  onContinue,
  onNew,
  onDelete,
}: {
  slot: SaveSlot;
  preview: SlotPreview;
  onContinue: () => void;
  onNew: () => void;
  onDelete: () => void;
}) {
  const { L } = useLanguage();
  const cls = preview?.className ? JOB_CLASSES[preview.className as keyof typeof JOB_CLASSES] : null;

  return (
    <div style={{
      background: preview
        ? "linear-gradient(160deg,#1e1608,#110d06)"
        : "linear-gradient(160deg,#120e06,#0a0806)",
      border: `1px solid ${preview ? "#5a3a10" : "#2a1e0a"}`,
      borderRadius: 8, padding: "18px 20px",
      minHeight: 130,
      display: "flex", flexDirection: "column", justifyContent: "space-between",
    }}>
      <div>
        <div style={{ fontSize: 10, color: "#4a3020", fontFamily: "'Cinzel',serif", letterSpacing: 2, marginBottom: 10 }}>
          {L(`存檔 ${slot}`, `SLOT ${slot}`, `存档 ${slot}`)}
        </div>
        {preview ? (
          <>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 15, color: "#e0c060", marginBottom: 4 }}>
              {preview.name}
            </div>
            <div style={{ fontSize: 11, color: "#8a7040" }}>
              Lv.{preview.level}
              {cls && <span style={{ marginLeft: 8 }}>{cls.icon} {L(cls.name, cls.nameEn)}</span>}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 12, color: "#3a2a14", fontStyle: "italic", marginTop: 4 }}>
            {L("— 空存檔 —", "— Empty —", "— 空存档 —")}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        {preview ? (
          <>
            <button className="btn btp" style={{ flex: 2, fontSize: 11 }} onClick={onContinue}>
              {L("繼續", "Continue", "继续")}
            </button>
            <button className="btn btd" style={{ flex: 1, fontSize: 11 }} onClick={onDelete}>
              {L("刪除", "Delete", "删除")}
            </button>
          </>
        ) : (
          <button className="btn btp" style={{ flex: 1, fontSize: 11 }} onClick={onNew}>
            {L("新遊戲", "New Game", "新游戏")}
          </button>
        )}
      </div>
    </div>
  );
}

export function SaveSlotSelect({ onSelect }: { onSelect: (slot: SaveSlot) => void }) {
  const { L } = useLanguage();
  const [previews, setPreviews] = useState<Record<SaveSlot, SlotPreview>>(() => ({
    1: getSlotPreview(1),
    2: getSlotPreview(2),
    3: getSlotPreview(3),
  }));

  const handleDelete = (slot: SaveSlot) => {
    if (!confirm(L(`確定刪除存檔 ${slot}？此操作無法復原。`, `Delete Slot ${slot}? This cannot be undone.`, `确定删除存档 ${slot}？此操作无法复原。`))) return;
    clearGameState(slot);
    setPreviews(p => ({ ...p, [slot]: null }));
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#0e0a06,#060402)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 28, color: "#e0a830", letterSpacing: 3, marginBottom: 6, textShadow: "0 0 30px rgba(200,140,30,0.4)" }}>
        ⚔ GLADIUS
      </div>
      <div style={{ fontSize: 11, color: "#4a3820", letterSpacing: 4, marginBottom: 40, textTransform: "uppercase" as const }}>
        {L("選擇存檔", "Select Save", "选择存档")}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, width: "100%", maxWidth: 600 }}>
        {SLOTS.map(slot => (
          <SlotCard
            key={slot}
            slot={slot}
            preview={previews[slot]}
            onContinue={() => onSelect(slot)}
            onNew={() => onSelect(slot)}
            onDelete={() => handleDelete(slot)}
          />
        ))}
      </div>

      <div style={{ fontSize: 10, color: "#2a1e0e", marginTop: 32 }}>
        {L("注意：一旦選擇轉職職業，道路將永久鎖定，只能重新打檔更換", "Note: Class path is permanent once chosen — restart to change lineage", "注意：一旦选择转职职业，道路将永久锁定，只能重新打档更换")}
      </div>
    </div>
  );
}
