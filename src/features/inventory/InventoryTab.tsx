import { WEAPON_CATEGORIES } from "../../game/data/weaponCategories";
import { getRarity } from "../../game/systems";

import { AffixLines } from "../../components/AffixLines";

type GameState = ReturnType<typeof import("../../game/useGameState").useGameState>;

type InventoryTabProps = {
  inventoryCount: number;
  inventoryFilterOptions: GameState["inventoryFilterOptions"];
  isEmpty: boolean;
  inventoryItems: GameState["inventoryItems"];
  onSortInventory: GameState["sortInventory"];
  onSellJunk: () => void;
};

export function InventoryTab({
  inventoryCount,
  inventoryFilterOptions,
  isEmpty,
  inventoryItems,
  onSortInventory,
  onSellJunk,
}: InventoryTabProps) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <div className="stl" style={{ margin: 0, border: "none", padding: 0, flex: 1 }}>
          背包 <span style={{ color: "#6a5030", fontSize: 13 }}>— {inventoryCount} 件</span>
        </div>
        <button className="btn btm" style={{ fontSize: 10, padding: "5px 10px" }} onClick={onSortInventory}>📂 整理</button>
        <button className="btn btd" style={{ fontSize: 10, padding: "5px 10px" }} onClick={onSellJunk}>🗑 賣普通品</button>
      </div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
        {inventoryFilterOptions.map((filter) => (
          <div key={filter.id} className={`wcat-btn${filter.isActive ? " active" : ""}`} onClick={filter.onSelect}>{filter.label}</div>
        ))}
      </div>
      {isEmpty && <div style={{ color: "#4a3a20", fontStyle: "italic" }}>（空）</div>}
      <div className="ig">
        {inventoryItems.map(({ item, onEquip, onSelectMerc, onSell, onUse, price, rarity, selectLabel }) => {
          if (item.type === "potion") {
            return (
              <div key={item.uid} className="ii">
                <div className="iii">{item.icon}</div>
                <div className="iin">{item.name}</div>
                <div className="iis" style={{ color: "#50a860" }}>回復 {item.heal}HP</div>
                <div style={{ color: "#f0c040", fontSize: 11, marginBottom: 4 }}>售 🪙{price}</div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="btn btm" style={{ flex: 1, fontSize: 9, padding: "5px" }} onClick={onUse}>使用</button>
                  <button className="btn btd" style={{ flex: 1, fontSize: 9, padding: "5px" }} onClick={onSell}>賣出</button>
                </div>
              </div>
            );
          }

          if (item.type === "merc_scroll") {
            return (
              <div key={item.uid} className="ii" style={{ borderColor: rarity.color + "66", background: `linear-gradient(160deg,${rarity.color}10,#120e06)`, boxShadow: rarity.glow || "none" }}>
                <div style={{ fontSize: 22, filter: `drop-shadow(0 2px 6px ${rarity.color}88)` }}>📜</div>
                <div className="rb" style={{ color: rarity.color, borderColor: rarity.color + "55", background: `${rarity.color}15` }}>{rarity.label}</div>
                <div className="iin" style={{ color: rarity.color, textShadow: rarity.glow ? `0 0 8px ${rarity.color}` : "none" }}>{item.name}</div>
                <div style={{ fontSize: 20, margin: "4px 0" }}>{item.icon}</div>
                <div className="iis">
                  <div style={{ color: "#c8781e" }}>攻擊 {item.attack}</div>
                  <div style={{ color: "#4a9fd4" }}>防禦 {item.defense}</div>
                  <div style={{ color: "#c84040" }}>HP {item.hp}</div>
                  {item.heal > 0 && <div style={{ color: "#50c890" }}>回復 {item.heal}/回</div>}
                </div>
                {item.affixes && item.affixes.length > 0 && (
                  <div className="iaf">
                    {item.affixes.map((affix: any, index: number) => (
                      <div key={index} className={`al${affix.special ? " as" : ""}`}>
                        {affix.stat
                          ? `${affix.tag}:+${affix.rolledVal || 0}`
                          : affix.special === "all"
                            ? `${affix.tag}:全屬+${Math.round((affix.rolledVal || 0) * 100)}%`
                            : affix.special === "first"
                              ? `${affix.tag}:先攻×${1 + (affix.rolledVal || 0)}`
                              : ""}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 10, color: "#5a4828", fontStyle: "italic", margin: "4px 0" }}>{item.desc}</div>
                <div style={{ color: "#f0c040", fontSize: 11, marginBottom: 4 }}>售 🪙{price}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <button className="btn btp" style={{ width: "100%", fontSize: 10 }} onClick={onSelectMerc}>
                    {selectLabel}
                  </button>
                  <button className="btn btd" style={{ width: "100%", fontSize: 10 }} onClick={onSell}>出售</button>
                </div>
              </div>
            );
          }

          const rarityInfo = getRarity(item.rarity);

          return (
            <div key={item.uid} className="ii" style={{ borderColor: rarityInfo.color + (rarityInfo.id === "normal" ? "33" : "77"), background: rarityInfo.id === "normal" ? "linear-gradient(160deg,#1a1208,#120e06)" : `linear-gradient(160deg,${rarityInfo.color}0a,#120e06)`, boxShadow: rarityInfo.glow || "none" }}>
              <div className="iii" style={{ filter: `drop-shadow(0 2px 4px ${rarityInfo.color}66)` }}>{item.icon}</div>
              {rarityInfo.id !== "normal" && <div className="rb" style={{ color: rarityInfo.color, borderColor: rarityInfo.color + "55", background: `${rarityInfo.color}15` }}>{rarityInfo.label}</div>}
              <div className="iin" style={{ color: rarityInfo.color }}>{item.name}</div>
              {item.itemLevel > 0 && <div style={{ fontSize: 9, color: "#5a4020", marginBottom: 2 }}>Lv.{item.itemLevel}</div>}
              <div className="iis">
                {item.attack > 0 && <div style={{ color: item.attack > 50 ? "#f5c040" : item.attack > 25 ? "#c8781e" : "#5a4020" }}>攻+{item.attack}</div>}
                {item.defense > 0 && <div style={{ color: item.defense > 40 ? "#80c0f0" : item.defense > 20 ? "#4a9fd4" : "#5a4020" }}>防+{item.defense}</div>}
                {item.hp > 0 && <div style={{ color: item.hp > 80 ? "#f06060" : item.hp > 40 ? "#c84040" : "#5a4020" }}>HP+{item.hp}</div>}
                {item.speed > 0 && <div style={{ color: "#5a9050" }}>速+{item.speed}</div>}
              </div>
              {item.cat && <div style={{ fontSize: 10, color: "#d08030", marginBottom: 3 }}>{item.cat && WEAPON_CATEGORIES[item.cat] ? WEAPON_CATEGORIES[item.cat].icon : ""}{item.cat && WEAPON_CATEGORIES[item.cat] ? WEAPON_CATEGORIES[item.cat].label : ""} · {item.cat && WEAPON_CATEGORIES[item.cat] ? WEAPON_CATEGORIES[item.cat].traitDesc : ""}</div>}
              <AffixLines affixes={item.affixes} />
              <div style={{ color: "#f0c040", fontSize: 11, margin: "5px 0" }}>售 🪙{price}</div>
              <div style={{ display: "flex", gap: 4 }}>
                <button className="btn btp" style={{ flex: 1, fontSize: 9, padding: "5px" }} onClick={onEquip}>裝備</button>
                <button className="btn btd" style={{ flex: 1, fontSize: 9, padding: "5px" }} onClick={onSell}>出售</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
