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
    <div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ItemRarity)}
      >
        <option value="normal">{L("⬜ 普通以下", "⬜ Common & below")}</option>
        <option value="magic">{L("🟢 魔法以下", "🟢 Magic & below")}</option>
        <option value="rare">{L("🔵 稀有以下", "🔵 Rare & below")}</option>
        <option value="legendary">{L("🟣 傳說以下", "🟣 Legendary & below")}</option>
      </select>
      <button onClick={onSell}>{t("shopSellAll")}</button>
    </div>
  );
}
