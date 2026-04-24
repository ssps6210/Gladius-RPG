type ItemRarity = "normal" | "magic" | "rare" | "legendary" | "mythic";

interface SellThresholdControlProps {
  value: ItemRarity;
  onChange: (value: ItemRarity) => void;
  onSell: () => void;
}

export function SellThresholdControl({ value, onChange, onSell }: SellThresholdControlProps) {
  return (
    <div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ItemRarity)}
      >
        <option value="normal">⬜ 普通以下</option>
        <option value="magic">🟢 魔法以下</option>
        <option value="rare">🔵 稀有以下</option>
        <option value="legendary">🟣 傳說以下</option>
      </select>
      <button onClick={onSell}>🗑 一鍵賣出</button>
    </div>
  );
}
