import { WEAPON_CATEGORIES } from "../game/data/weaponCategories";
import { getRarity } from "../game/systems";

import { AffixLines } from "./AffixLines";

export function LootPopup({ item, onEquip, onTake, onDiscard }: {
  item: any;
  onEquip: () => void;
  onTake: () => void;
  onDiscard: () => void;
}) {
  const lr = getRarity(item.rarity);
  const isMercScroll = item.type === "merc_scroll";
  return (
    <div className="lp">
      <div className="lb" style={{
        borderColor: lr.color + "99",
        boxShadow: `0 0 60px rgba(0,0,0,.9), ${lr.glow || "0 0 20px rgba(139,90,20,.2)"}`,
      }}>
        <div className="ltl">{isMercScroll ? "📜 傭兵契約捲軸" : "✨ 戰利品掉落 ✨"}</div>
        <div className="lii" style={{ filter: `drop-shadow(0 4px 12px ${lr.color}88)` }}>{item.icon}</div>
        <div className="lin" style={{ color: lr.color, textShadow: lr.glow ? `0 0 12px ${lr.color}` : "none" }}>{item.name}</div>
        <div className="rb" style={{ color: lr.color, borderColor: lr.color + "66", background: `${lr.color}18` }}>{lr.label}</div>
        {item.cat && (
          <div style={{ fontSize: 11, color: "#d08030", margin: "5px 0" }}>
            {WEAPON_CATEGORIES[item.cat] ? WEAPON_CATEGORIES[item.cat].icon : ""}{" "}
            {WEAPON_CATEGORIES[item.cat] ? WEAPON_CATEGORIES[item.cat].label : ""}{" · "}
            {WEAPON_CATEGORIES[item.cat] ? WEAPON_CATEGORIES[item.cat].traitDesc : ""}
          </div>
        )}
        <div className="lst">
          {item.attack > 0  && <div>攻擊 {isMercScroll ? "" : "+"}{item.attack}</div>}
          {item.defense > 0 && <div>防禦 {isMercScroll ? "" : "+"}{item.defense}</div>}
          {item.hp > 0      && <div>HP {isMercScroll ? "" : "+"}{item.hp}</div>}
          {item.speed > 0   && <div>速度 +{item.speed}</div>}
          {item.heal > 0    && <div style={{ color: "#50c890" }}>每回合回復 {item.heal}HP</div>}
          {item.itemLevel   && <div style={{ color: "#5a4020", fontSize: 11 }}>物品等級 {item.itemLevel}</div>}
        </div>
        <AffixLines affixes={item.affixes} />
        <div className="la">
          {isMercScroll ? (
            <>
              <button className="btn btp" onClick={onTake}>📜 收入背包</button>
              <button className="btn btd" onClick={onDiscard}>🗑 丟棄</button>
            </>
          ) : (
            <>
              <button className="btn btp" onClick={onEquip}>⚔ 裝備</button>
              <button className="btn btm" onClick={onTake}>🎒 背包</button>
              <button className="btn btd" onClick={onDiscard}>🗑 丟棄</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
