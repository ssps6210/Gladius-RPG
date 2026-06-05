import type { ReactNode } from "react";

import { EQUIP_SLOTS } from "../game/data/equipmentSlots";
import { WEAPON_CATEGORIES } from "../game/data/weaponCategories";
import { getRarity } from "../game/systems";
import { getSetForItem } from "../game/data/sets";
import { useLanguage } from "../game/i18n/LanguageContext";

import { AffixLines } from "./AffixLines";

export function ItemCard({ item, onEquip, onUse, footer }: { item: any; onEquip?: any; onUse?: any; footer?: ReactNode }) {
  const { t, tr, L } = useLanguage();
  const rar = getRarity(item.rarity);
  const rc = rar.color;
  const glow = rar.glow;
  const isNormal = item.rarity === "normal" || !item.rarity;
  const cat = item.cat ? WEAPON_CATEGORIES[item.cat] : null;
  const slotDef = EQUIP_SLOTS.find(s => s.id === item.slot);
  return (
    <div className="ii" style={{
      borderColor: isNormal ? "#2e1e0a" : rc + "88",
      boxShadow: glow ? `${glow}, inset 0 0 20px rgba(0,0,0,0.3)` : "none",
      background: isNormal
        ? "linear-gradient(160deg,#1a1208,#120e06)"
        : `linear-gradient(160deg, ${rc}0a 0%, #120e06 60%)`,
    }}>
      <div className="iii" style={{ filter: `drop-shadow(0 2px 4px ${rc}66)` }}>{item.icon}</div>
      {!isNormal && (
        <div className="rb" style={{
          color: rc, borderColor: rc + "66", background: `${rc}15`,
          textShadow: glow ? `0 0 8px ${rc}` : "none",
        }}>{tr(rar, "label")}</div>
      )}
      <div className="iin" style={{
        color: rc,
        textShadow: glow && !isNormal ? `0 0 10px ${rc}88` : "none",
      }}>{tr(item, "name")}</div>
      {item.itemLevel > 0 && (
        <div style={{ fontSize: 9, color: "#6a5028", marginBottom: 2 }}>
          Lv.{item.itemLevel} · ×{Math.pow(1.25, Math.floor(item.itemLevel / 10)).toFixed(2)}{L("倍", "")}
        </div>
      )}
      {cat && <div className="icat">{cat.icon} {tr(cat, "label")}</div>}
      {!cat && slotDef && <div className="icat">{slotDef.icon} {tr(slotDef, "label")}</div>}
      <div className="iis">
        {item.attack > 0  && <div style={{ color: item.attack > 50 ? "#f5c040" : item.attack > 25 ? "#e8a030" : "#5a4020" }}>{L("攻擊", "ATK")} +{item.attack}</div>}
        {item.defense > 0 && <div style={{ color: item.defense > 40 ? "#80c0f0" : item.defense > 20 ? "#4a9fd4" : "#5a4020" }}>{L("防禦", "DEF")} +{item.defense}</div>}
        {item.hp > 0      && <div style={{ color: item.hp > 80 ? "#f06060" : item.hp > 40 ? "#c84040" : "#5a4020" }}>HP +{item.hp}</div>}
        {item.speed > 0   && <div style={{ color: "#5a9050" }}>{L("速度", "SPD")} +{item.speed}</div>}
        {item.heal        && <div style={{ color: "#50a860" }}>{L("回復", "Heal")} {item.heal} HP</div>}
      </div>
      {cat && <div className="icat" style={{ color: "#d08030", fontSize: 10 }}>{tr(cat, "traitDesc")}</div>}
      <AffixLines affixes={item.affixes} />
      {(() => {
        const setDef = getSetForItem(item.name);
        if (setDef) {
          return (
            <div style={{ marginTop: 4, padding: "2px 4px", background: "rgba(60,180,60,0.1)", border: "1px solid #2a4020", borderRadius: 3, fontSize: 9, color: "#60a060" }}>
              🛡 {tr(setDef, "name")} · {setDef.itemNames.length}{L("件套", "-pc set")}
            </div>
          );
        }
        return null;
      })()}
      <div style={{ marginTop: 7, display: "flex", flexDirection: "column", gap: 4 }}>
        {onEquip && <button className="btn btp" style={{ width: "100%", fontSize: 10 }} onClick={onEquip}>{L("裝備", "Equip")}</button>}
        {onUse   && <button className="btn btm" style={{ width: "100%", fontSize: 10 }} onClick={onUse}>{L("使用", "Use")}</button>}
        {footer}
      </div>
    </div>
  );
}
