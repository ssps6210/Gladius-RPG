import { useState } from "react";

import { WEAPON_CATEGORIES } from "../../game/data/weaponCategories";
import { getRarity } from "../../game/systems";
import { useLanguage } from "../../game/i18n/LanguageContext";

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

function StatDiff({ label, newVal, oldVal }: { label: string; newVal: number; oldVal: number }) {
  const diff = newVal - oldVal;
  if (newVal === 0 && oldVal === 0) return null;
  return (
    <div style={{ fontSize: 9, display: "flex", gap: 3, alignItems: "center" }}>
      <span style={{ color: "#6a5030" }}>{label}</span>
      <span style={{ color: "#8a7040" }}>{newVal}</span>
      {diff !== 0 && (
        <span style={{ color: diff > 0 ? "#4caf50" : "#c84040", fontWeight: "bold" }}>
          ({diff > 0 ? "+" : ""}{diff})
        </span>
      )}
    </div>
  );
}

function CompareTooltip({ newItem, equipped }: { newItem: any; equipped: any }) {
  const { L } = useLanguage();
  const eq = equipped || { attack: 0, defense: 0, hp: 0, speed: 0 };
  return (
    <div style={{
      position: "absolute", left: "calc(100% + 6px)", top: 0,
      background: "linear-gradient(160deg,#1a1208,#0e0a06)",
      border: "1px solid #4a3010", borderRadius: 6, padding: "8px 10px",
      width: 130, zIndex: 100, boxShadow: "0 4px 16px rgba(0,0,0,0.7)",
      pointerEvents: "none",
    }}>
      <div style={{ fontSize: 9, color: "#8a6030", fontFamily: "'Cinzel',serif", marginBottom: 4, borderBottom: "1px solid #2a1808", paddingBottom: 3 }}>
        {equipped ? L("▲ 與已裝備比較", "▲ vs Equipped") : L("（插槽為空）", "(slot empty)")}
      </div>
      {equipped && (
        <div style={{ fontSize: 9, color: "#6a5028", marginBottom: 4, fontStyle: "italic" }}>
          {equipped.name || equipped.nameEn}
        </div>
      )}
      <StatDiff label={L("攻", "ATK")} newVal={newItem.attack || 0} oldVal={eq.attack || 0} />
      <StatDiff label={L("防", "DEF")} newVal={newItem.defense || 0} oldVal={eq.defense || 0} />
      <StatDiff label="HP" newVal={newItem.hp || 0} oldVal={eq.hp || 0} />
      <StatDiff label={L("速", "SPD")} newVal={newItem.speed || 0} oldVal={eq.speed || 0} />
    </div>
  );
}

export function InventoryTab({
  inventoryCount,
  inventoryFilterOptions,
  isEmpty,
  inventoryItems,
  onSortInventory,
  onSellJunk,
}: InventoryTabProps) {
  const { t, tr, L } = useLanguage();
  const [hoveredUid, setHoveredUid] = useState<string | null>(null);

  return (
    <div>
      <div style={{ position: "relative", height: 140, borderRadius: 6, overflow: "hidden", marginBottom: 14 }}>
        <img src="./portraits/inventory.png" alt="Inventory" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%)" }} />
        <div style={{ position: "absolute", bottom: 10, left: 14 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 17, color: "#e8c87a", textShadow: "0 2px 8px rgba(0,0,0,0.9)", letterSpacing: 1 }}>
            {t("tabInventory")}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <div className="stl" style={{ margin: 0, border: "none", padding: 0, flex: 1 }}>
          <span style={{ color: "#6a5030", fontSize: 13 }}>{inventoryCount}{t("invCount")}</span>
        </div>
        <button className="btn btm" style={{ fontSize: 10, padding: "5px 10px" }} onClick={onSortInventory}>{t("invSort")}</button>
        <button className="btn btd" style={{ fontSize: 10, padding: "5px 10px" }} onClick={onSellJunk}>{L("🗑 賣普通品", "🗑 Sell junk")}</button>
      </div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
        {inventoryFilterOptions.map((filter) => (
          <div key={filter.id} className={`wcat-btn${filter.isActive ? " active" : ""}`} onClick={filter.onSelect}>{filter.label}</div>
        ))}
      </div>
      {isEmpty && <div style={{ color: "#4a3a20", fontStyle: "italic" }}>{t("slotEmpty")}</div>}
      <div className="ig">
        {inventoryItems.map(({ item, currentEquipped, currentEquipped2, secondarySlotId, onEquip, onEquip2, onSelectMerc, onSell, onUse, price, rarity, selectLabel }) => {
          if (item.type === "potion") {
            return (
              <div key={item.uid} className="ii">
                <div className="iii">{item.icon}</div>
                <div className="iin">{tr(item, "name")}</div>
                <div className="iis" style={{ color: "#50a860" }}>{L("回復", "Heal")} {item.heal}HP</div>
                <div style={{ color: "#f0c040", fontSize: 11, marginBottom: 4 }}>{L("售", "Sell")} 🪙{price}</div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="btn btm" style={{ flex: 1, fontSize: 9, padding: "5px" }} onClick={onUse}>{L("使用", "Use")}</button>
                  <button className="btn btd" style={{ flex: 1, fontSize: 9, padding: "5px" }} onClick={onSell}>{L("賣出", "Sell")}</button>
                </div>
              </div>
            );
          }

          if (item.type === "merc_scroll") {
            return (
              <div key={item.uid} className="ii" style={{ borderColor: rarity.color + "66", background: `linear-gradient(160deg,${rarity.color}10,#120e06)`, boxShadow: rarity.glow || "none" }}>
                <div style={{ fontSize: 22, filter: `drop-shadow(0 2px 6px ${rarity.color}88)` }}>📜</div>
                <div className="rb" style={{ color: rarity.color, borderColor: rarity.color + "55", background: `${rarity.color}15` }}>{tr(rarity, "label")}</div>
                <div className="iin" style={{ color: rarity.color, textShadow: rarity.glow ? `0 0 8px ${rarity.color}` : "none" }}>{tr(item, "name")}</div>
                <div style={{ fontSize: 20, margin: "4px 0" }}>{item.icon}</div>
                <div className="iis">
                  <div style={{ color: "#c8781e" }}>{L("攻擊", "ATK")} {item.attack}</div>
                  <div style={{ color: "#4a9fd4" }}>{L("防禦", "DEF")} {item.defense}</div>
                  <div style={{ color: "#c84040" }}>HP {item.hp}</div>
                  {item.heal > 0 && <div style={{ color: "#50c890" }}>{L("回復", "Heal")} {item.heal}/{L("回", "rd")}</div>}
                </div>
                {item.affixes && item.affixes.length > 0 && (
                  <div className="iaf">
                    {item.affixes.map((affix: any, index: number) => (
                      <div key={index} className={`al${affix.special ? " as" : ""}`}>
                        {affix.stat
                          ? `${tr(affix, "tag")}:+${affix.rolledVal || 0}`
                          : affix.special === "all"
                            ? `${tr(affix, "tag")}:${L("全屬+", "All +")}${Math.round((affix.rolledVal || 0) * 100)}%`
                            : affix.special === "first"
                              ? `${tr(affix, "tag")}:${L("先攻×", "First ×")}${1 + (affix.rolledVal || 0)}`
                              : ""}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 10, color: "#5a4828", fontStyle: "italic", margin: "4px 0" }}>{tr(item, "desc")}</div>
                <div style={{ color: "#f0c040", fontSize: 11, marginBottom: 4 }}>{L("售", "Sell")} 🪙{price}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <button className="btn btp" style={{ width: "100%", fontSize: 10 }} onClick={onSelectMerc}>
                    {selectLabel}
                  </button>
                  <button className="btn btd" style={{ width: "100%", fontSize: 10 }} onClick={onSell}>{L("出售", "Sell")}</button>
                </div>
              </div>
            );
          }

          const rarityInfo = getRarity(item.rarity);
          const showCompare = hoveredUid === item.uid && !!item.slot;

          return (
            <div
              key={item.uid}
              className="ii"
              style={{
                borderColor: rarityInfo.color + (rarityInfo.id === "normal" ? "33" : "77"),
                background: rarityInfo.id === "normal" ? "linear-gradient(160deg,#1a1208,#120e06)" : `linear-gradient(160deg,${rarityInfo.color}0a,#120e06)`,
                boxShadow: rarityInfo.glow || "none",
                position: "relative",
              }}
              onMouseEnter={() => setHoveredUid(item.uid)}
              onMouseLeave={() => setHoveredUid(null)}
            >
              {showCompare && <CompareTooltip newItem={item} equipped={currentEquipped} />}
              <div className="iii" style={{ filter: `drop-shadow(0 2px 4px ${rarityInfo.color}66)` }}>{item.icon}</div>
              {rarityInfo.id !== "normal" && <div className="rb" style={{ color: rarityInfo.color, borderColor: rarityInfo.color + "55", background: `${rarityInfo.color}15` }}>{tr(rarityInfo, "label")}</div>}
              <div className="iin" style={{ color: rarityInfo.color }}>{tr(item, "name")}</div>
              {item.itemLevel > 0 && <div style={{ fontSize: 9, color: "#5a4020", marginBottom: 2 }}>Lv.{item.itemLevel}</div>}
              <div className="iis">
                {item.attack > 0 && <div style={{ color: item.attack > 50 ? "#f5c040" : item.attack > 25 ? "#c8781e" : "#5a4020" }}>{L("攻", "ATK")}+{item.attack}</div>}
                {item.defense > 0 && <div style={{ color: item.defense > 40 ? "#80c0f0" : item.defense > 20 ? "#4a9fd4" : "#5a4020" }}>{L("防", "DEF")}+{item.defense}</div>}
                {item.hp > 0 && <div style={{ color: item.hp > 80 ? "#f06060" : item.hp > 40 ? "#c84040" : "#5a4020" }}>HP+{item.hp}</div>}
                {item.speed > 0 && <div style={{ color: "#5a9050" }}>{L("速", "SPD")}+{item.speed}</div>}
              </div>
              {item.cat && WEAPON_CATEGORIES[item.cat] && <div style={{ fontSize: 10, color: "#d08030", marginBottom: 3 }}>{WEAPON_CATEGORIES[item.cat].icon}{tr(WEAPON_CATEGORIES[item.cat], "label")} · {tr(WEAPON_CATEGORIES[item.cat], "traitDesc")}</div>}
              <AffixLines affixes={item.affixes} />
              <div style={{ color: "#f0c040", fontSize: 11, margin: "5px 0" }}>{L("售", "Sell")} 🪙{price}</div>
              <div style={{ display: "flex", gap: 4 }}>
                <button className="btn btp" style={{ flex: 1, fontSize: 9, padding: "5px" }} onClick={onEquip}>{L("裝備", "Equip")}</button>
                <button className="btn btd" style={{ flex: 1, fontSize: 9, padding: "5px" }} onClick={onSell}>{L("出售", "Sell")}</button>
              </div>
              {onEquip2 && secondarySlotId && (
                <div style={{ marginTop: 4 }}>
                  <button
                    className="btn btm"
                    style={{ width: "100%", fontSize: 9, padding: "4px 5px", color: "#a08040" }}
                    onClick={onEquip2}
                    title={currentEquipped2 ? (currentEquipped2 as any).name || "" : ""}
                  >
                    {L("副槽裝備", "Equip Slot 2")}
                    {currentEquipped2
                      ? <span style={{ color: "#6a5028", marginLeft: 3 }}>({L("替換", "swap")})</span>
                      : <span style={{ color: "#4a3820", marginLeft: 3 }}>({L("空", "empty")})</span>}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
