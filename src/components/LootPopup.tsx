import { WEAPON_CATEGORIES } from "../game/data/weaponCategories";
import { getRarity } from "../game/systems";
import { useLanguage } from "../game/i18n/LanguageContext";

import { AffixLines } from "./AffixLines";

export function LootPopup({ item, onEquip, onTake, onDiscard }: {
  item: any;
  onEquip: () => void;
  onTake: () => void;
  onDiscard: () => void;
}) {
  const { t, tr, L } = useLanguage();
  const lr = getRarity(item.rarity);
  const isMercScroll = item.type === "merc_scroll";
  const cat = item.cat ? WEAPON_CATEGORIES[item.cat] : null;
  return (
    <div className="lp">
      <div className="lb" style={{
        borderColor: lr.color + "99",
        boxShadow: `0 0 60px rgba(0,0,0,.9), ${lr.glow || "0 0 20px rgba(139,90,20,.2)"}`,
      }}>
        <div className="ltl">{isMercScroll ? L("📜 傭兵契約捲軸", "📜 Merc Contract Scroll") : t("lootTitle")}</div>
        <div className="lii" style={{ filter: `drop-shadow(0 4px 12px ${lr.color}88)` }}>{item.icon}</div>
        <div className="lin" style={{ color: lr.color, textShadow: lr.glow ? `0 0 12px ${lr.color}` : "none" }}>{tr(item, "name")}</div>
        <div className="rb" style={{ color: lr.color, borderColor: lr.color + "66", background: `${lr.color}18` }}>{tr(lr, "label")}</div>
        {cat && (
          <div style={{ fontSize: 11, color: "#d08030", margin: "5px 0" }}>
            {cat.icon}{" "}
            {tr(cat, "label")}{" · "}
            {tr(cat, "traitDesc")}
          </div>
        )}
        <div className="lst">
          {item.attack > 0  && <div>{L("攻擊", "ATK")} {isMercScroll ? "" : "+"}{item.attack}</div>}
          {item.defense > 0 && <div>{L("防禦", "DEF")} {isMercScroll ? "" : "+"}{item.defense}</div>}
          {item.hp > 0      && <div>HP {isMercScroll ? "" : "+"}{item.hp}</div>}
          {item.speed > 0   && <div>{L("速度", "SPD")} +{item.speed}</div>}
          {item.heal > 0    && <div style={{ color: "#50c890" }}>{L(`每回合回復 ${item.heal}HP`, `Heal ${item.heal} HP/round`)}</div>}
          {item.itemLevel   && <div style={{ color: "#5a4020", fontSize: 11 }}>{L("物品等級", "Item Lv")} {item.itemLevel}</div>}
        </div>
        <AffixLines affixes={item.affixes} />
        <div className="la">
          {isMercScroll ? (
            <>
              <button className="btn btp" onClick={onTake}>{t("scrollToBag")}</button>
              <button className="btn btd" onClick={onDiscard}>{t("btnDiscard")}</button>
            </>
          ) : (
            <>
              <button className="btn btp" onClick={onEquip}>{t("btnEquip")}</button>
              <button className="btn btm" onClick={onTake}>{t("btnToBag")}</button>
              <button className="btn btd" onClick={onDiscard}>{t("btnDiscard")}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
