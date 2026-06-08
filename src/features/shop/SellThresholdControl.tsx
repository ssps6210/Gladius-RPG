import { useLanguage } from "../../game/i18n/LanguageContext";

type ItemRarity = "normal" | "magic" | "rare" | "legendary" | "mythic";

interface SellThresholdControlProps {
  value: ItemRarity;
  onChange: (value: ItemRarity) => void;
  onSell: () => void;
}

export function SellThresholdControl({ value, onChange, onSell }: SellThresholdControlProps) {
  const { t, L } = useLanguage();
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ItemRarity)}
        style={{
          background: "#0e0a05",
          border: "1px solid #4a3010",
          borderRadius: 3,
          color: "#f0c040",
          padding: "6px 10px",
          fontSize: 11,
          fontFamily: "'Cinzel', serif",
          cursor: "pointer",
          outline: "none",
        }}
      >
        <option value="normal">{L("⬜ 普通以下", "⬜ Common & below")}</option>
        <option value="magic">{L("🟢 魔法以下", "🟢 Magic & below")}</option>
        <option value="rare">{L("🔵 稀有以下", "🔵 Rare & below")}</option>
        <option value="legendary">{L("🟣 傳說以下", "🟣 Legendary & below")}</option>
        <option value="mythic">{L("🔴 神話以下", "🔴 Mythic & below")}</option>
      </select>
      <button className="btn btd" style={{ fontSize: 10, padding: "7px 14px" }} onClick={onSell}>{t("shopSellAll")}</button>
    </div>
  );
}
