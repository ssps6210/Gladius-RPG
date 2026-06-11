import { useLanguage } from "../../game/i18n/LanguageContext";
import type { DungeonModifier } from "../../game/data/dungeonModifiers";

const TYPE_COLOR: Record<string, string> = {
  positive: "#4caf50",
  negative: "#c84040",
  mixed:    "#c8961e",
};

const TYPE_LABEL: Record<string, [string, string, string]> = {
  positive: ["利好詞綴", "Buff",    "利好词缀"],
  negative: ["負面詞綴", "Debuff",  "负面词缀"],
  mixed:    ["雙刃詞綴", "Mixed",   "双刃词缀"],
};

function EffectRow({ label, value, negative }: { label: string; value: string; negative?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "3px 0", borderBottom: "1px solid #1a1208" }}>
      <span style={{ color: "#6a5030" }}>{label}</span>
      <span style={{ color: negative ? "#c84040" : "#4caf50", fontWeight: "bold" }}>{value}</span>
    </div>
  );
}

export function DungeonModifierModal({
  modifier,
  dungeonName,
  tierLabel,
  onConfirm,
  onCancel,
}: {
  modifier: DungeonModifier;
  dungeonName: string;
  tierLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { L } = useLanguage();

  const typeColor = TYPE_COLOR[modifier.type] ?? "#c8961e";
  const [typeLabelZh, typeLabelEn, typeLabelCn] = TYPE_LABEL[modifier.type] ?? ["詞綴", "Modifier", "词缀"];

  const effects: { label: string; value: string; negative: boolean }[] = [];
  if (modifier.playerAtkMult != null && modifier.playerAtkMult !== 1) {
    const pct = Math.round((modifier.playerAtkMult - 1) * 100);
    effects.push({ label: L("攻擊", "ATK", "攻击"), value: `${pct > 0 ? "+" : ""}${pct}%`, negative: pct < 0 });
  }
  if (modifier.playerDefMult != null && modifier.playerDefMult !== 1) {
    const pct = Math.round((modifier.playerDefMult - 1) * 100);
    effects.push({ label: L("防禦", "DEF", "防御"), value: `${pct > 0 ? "+" : ""}${pct}%`, negative: pct < 0 });
  }
  if (modifier.playerHpMult != null && modifier.playerHpMult !== 1) {
    const pct = Math.round((modifier.playerHpMult - 1) * 100);
    effects.push({ label: "HP", value: `${pct > 0 ? "+" : ""}${pct}%`, negative: pct < 0 });
  }
  if (modifier.monsterHpMult != null && modifier.monsterHpMult !== 1) {
    const pct = Math.round((modifier.monsterHpMult - 1) * 100);
    effects.push({ label: L("怪物HP", "Monster HP", "怪物HP"), value: `${pct > 0 ? "+" : ""}${pct}%`, negative: pct > 0 });
  }
  if (modifier.expMult != null && modifier.expMult !== 1) {
    const pct = Math.round((modifier.expMult - 1) * 100);
    effects.push({ label: "EXP", value: `${pct > 0 ? "+" : ""}${pct}%`, negative: pct < 0 });
  }
  if (modifier.goldMult != null && modifier.goldMult !== 1) {
    const pct = Math.round((modifier.goldMult - 1) * 100);
    effects.push({ label: L("金幣", "Gold", "金币"), value: `${pct > 0 ? "+" : ""}${pct}%`, negative: pct < 0 });
  }
  if (modifier.noWaveHeal) {
    effects.push({ label: L("波次回復", "Wave Heal", "波次回复"), value: L("禁止", "Disabled", "禁止"), negative: true });
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 800,
      background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(3px)",
    }}>
      <div style={{
        width: "min(380px, 92vw)",
        background: "linear-gradient(160deg,#1e1608,#130e06)",
        border: `2px solid ${typeColor}66`,
        borderRadius: 10,
        padding: "24px 22px 20px",
        boxShadow: `0 0 40px ${typeColor}22, 0 8px 32px rgba(0,0,0,0.8)`,
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: "#5a4020", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>
            {L("進入", "Entering", "进入")} {dungeonName} · {tierLabel}
          </div>
          <div style={{
            display: "inline-block", padding: "2px 10px", borderRadius: 3,
            background: `${typeColor}20`, border: `1px solid ${typeColor}55`,
            fontSize: 10, color: typeColor, marginBottom: 12,
          }}>
            {L(typeLabelZh, typeLabelEn, typeLabelCn)}
          </div>
          <div style={{ fontSize: 40, marginBottom: 8, filter: `drop-shadow(0 0 12px ${typeColor}66)` }}>
            {modifier.icon}
          </div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 17, color: typeColor, letterSpacing: 1, marginBottom: 6 }}>
            {L(modifier.label, modifier.labelEn, modifier.labelCn)}
          </div>
          <div style={{ fontSize: 12, color: "#8a7050", lineHeight: 1.65 }}>
            {L(modifier.desc, modifier.descEn, modifier.descCn)}
          </div>
        </div>

        {/* Effects list */}
        {effects.length > 0 && (
          <div style={{ background: "#0c0a06", borderRadius: 5, padding: "10px 12px", marginBottom: 18 }}>
            {effects.map((e, i) => (
              <EffectRow key={i} label={e.label} value={e.value} negative={e.negative} />
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btm"
            style={{ flex: 1, fontSize: 12, padding: "10px" }}
            onClick={onCancel}
          >
            {L("✖ 撤退", "✖ Retreat", "✖ 撤退")}
          </button>
          <button
            className="btn btp"
            style={{ flex: 2, fontSize: 12, padding: "10px" }}
            onClick={onConfirm}
          >
            {L("⚔ 確認出發", "⚔ Charge!", "⚔ 确认出发")}
          </button>
        </div>
      </div>
    </div>
  );
}
