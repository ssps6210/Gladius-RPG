import { useLanguage } from "../../game/i18n/LanguageContext";

type GameState = ReturnType<typeof import("../../game/useGameState").useGameState>;

type DungeonTabProps = {
  expeditionCards: GameState["expeditionCards"];
  dungeonSections: GameState["dungeonSections"];
  mercScrollsInInv: GameState["mercScrollsInInv"];
  mercSelectionCards: GameState["mercSelectionCards"];
  selectedScrolls: GameState["selectedScrolls"];
  mercDungeonCards: GameState["mercDungeonCards"];
  onAddFreeMercScroll: GameState["addFreeMercScroll"];
  dungeonInjuredUntil?: number;
};

export function DungeonTab({
  expeditionCards,
  dungeonSections,
  mercScrollsInInv,
  mercSelectionCards,
  selectedScrolls,
  mercDungeonCards,
  onAddFreeMercScroll,
  dungeonInjuredUntil = 0,
}: DungeonTabProps) {
  const { t, tr, L } = useLanguage();
  const now = Date.now();
  const isInjured = now < dungeonInjuredUntil;
  return (
    <div>
      <div style={{
        position: "relative", width: "100%", height: 140, marginBottom: 16,
        borderRadius: 6, overflow: "hidden", border: "1px solid #3a2410",
      }}>
        <img src="./portraits/map.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 50%", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(10,7,3,0.92) 100%)" }} />
        <div style={{ position: "absolute", bottom: 12, left: 16, fontFamily: "'Cinzel',serif", fontSize: 18, color: "#e8c050", letterSpacing: 3, textShadow: "0 0 20px rgba(200,150,30,0.6)" }}>
          🗺️ {t("tabDungeon")}
        </div>
      </div>
      {isInjured && (
        <div style={{
          background: "linear-gradient(160deg,#2a0e0e,#1a0808)",
          border: "1px solid #6a1a1a",
          borderLeft: "3px solid #c84040",
          borderRadius: 6,
          padding: "14px 16px",
          marginBottom: 16,
        }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: "#e05050", marginBottom: 6 }}>
            ⚔ {L("你因落敗而受傷，無法出戰", "You are wounded from defeat and cannot fight", "你因落败而受伤，无法出战")}
          </div>
          <div style={{ fontSize: 11, color: "#7a3030" }}>
            {L("傷勢尚未痊癒，需等待恢復", "Still recovering — rest and wait", "伤势尚未痊愈，需等待恢复")}
          </div>
        </div>
      )}

      <div className="sub">{t("expTitle")}</div>
      <div style={{ fontSize: 12, color: "#5a4020", marginBottom: 10, fontStyle: "italic" }}>
        {t("expSubtitle")}
      </div>
      <div className="dr" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(135px,1fr))" }}>
        {expeditionCards.map(({ expedition, icon, isLocked, monsterName, onStart, style, traitDesc }) => {
          return (
            <div key={expedition.id} className={`dc${isLocked ? " lk" : ""}`} onClick={onStart}
              style={style}>
              <div className="di">{icon}</div>
              <div className="dn" style={{ fontSize: 11 }}>{tr(expedition, "name")}</div>
              <div style={{ fontSize: 10, color: "#8a6a30", marginBottom: 3, fontStyle: "italic" }}>{monsterName}</div>
              <div style={{ fontSize: 10, color: "#c8781e", marginBottom: 4 }}>{traitDesc}</div>
              <div className="drq">Lv.{expedition.minLv}{isLocked ? " 🔒" : ""}</div>
              <div className="drw">EXP×{expedition.expMult} {L("金", "G")}×{expedition.goldMult}{expedition.lootBonus > 0 && <span style={{ color: "#4caf50" }}> +{Math.round(expedition.lootBonus * 100)}%</span>}</div>
            </div>
          );
        })}
      </div>

      <div className="sub" style={{ marginTop: 24 }}>{t("dunTitle")}</div>
      <div style={{ fontSize: 12, color: "#5a4020", marginBottom: 10, fontStyle: "italic" }}>
        {t("dunDesc")}
      </div>
      {dungeonSections.map(d => (
        <div className="dz" key={d.id}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>{d.icon}</span>
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: "#c8961e", letterSpacing: 1 }}>{tr(d, "name")} <span style={{ fontSize: 10, color: "#5a4020" }}>Lv.{d.minLv}+</span></div>
              <div style={{ fontSize: 11, color: "#6a5030", fontStyle: "italic" }}>{tr(d, "lore")}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            {d.waveBadges.map((wave: any, wi: number) => (
              <div key={wi} style={{ fontSize: 10, color: "#5a4030", background: "rgba(0,0,0,0.3)", border: "1px solid #2a1a08", borderRadius: 3, padding: "2px 6px" }}>
                {wave.enemies} {tr(wave, "label")}
              </div>
            ))}
            <div style={{ fontSize: 10, color: "#c84040", background: "rgba(100,0,0,0.2)", border: "1px solid #4a1010", borderRadius: 3, padding: "2px 6px" }}>
              👑 {d.bossIcon}{d.bossName}
            </div>
          </div>
          <div className="dr">
            {d.tierCards.map(({ isLocked, onStart, req, tier }) => {
              return (
                <div key={tier.id} className={`dc${isLocked ? " lk" : ""}`} onClick={onStart}>
                  <div className="di">{d.icon}</div>
                  <div className="dtl" style={{ color: tier.color }}>{tr(tier, "label")}</div>
                  <div className="dn" style={{ fontSize: 11, color: tier.color }}>{tr(d, "name")}</div>
                  <div className="drq">Lv.{req}{isLocked ? " 🔒" : ""}</div>
                  <div className="drw">EXP×{tier.expMult} {L("金", "G")}×{tier.goldMult}{tier.lootBonus > 0 && <span style={{ color: "#d4b84a" }}> +{Math.round(tier.lootBonus * 100)}%</span>}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="dz">
        <div className="sub">{t("mercTitle")}</div>
        <div style={{ marginBottom: 10, padding: "8px 12px", background: "#120e06", border: "1px solid #2a1a08", borderRadius: 5, fontSize: 12, color: "#6a5030", lineHeight: 1.7 }}>
          {t("mercScrollDesc")}
        </div>

        {mercScrollsInInv.length === 0 ? (
          <div style={{ padding: "12px", background: "rgba(0,0,0,0.3)", border: "1px solid #2a1a08", borderRadius: 4, fontSize: 12, color: "#4a3020", textAlign: "center", marginBottom: 10 }}>
            {t("noScrolls")}
            <div style={{ marginTop: 8 }}>
              <button className="btn btm" style={{ fontSize: 10 }} onClick={onAddFreeMercScroll}>{L("🎲 購買隨機捲軸（免費測試）", "🎲 Get Random Scroll (test)", "🎲 购买随机卷轴（免费测试）")}</button>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "#6a5030", marginBottom: 6, fontFamily: "'Cinzel',serif" }}>{t("selectMercs")}</div>
            <div className="mg" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))" }}>
              {mercSelectionCards.map(({ onToggle, rarity, scroll, statusText, statusTextColor, style }) => {
                return (
                  <div key={scroll.uid}
                    style={style}
                    onClick={onToggle}>
                    <div style={{ fontSize: 22, filter: `drop-shadow(0 2px 6px ${rarity.color}88)` }}>{scroll.icon}</div>
                    <div style={{ fontSize: 9, color: rarity.color, fontFamily: "'Cinzel',serif", borderColor: `${rarity.color}55`, border: "1px solid", borderRadius: 2, padding: "1px 4px", display: "inline-block", margin: "3px 0" }}>{tr(rarity, "label")}</div>
                    <div style={{ fontSize: 11, color: rarity.color, fontFamily: "'Cinzel',serif", letterSpacing: 0.3, textShadow: rarity.glow ? `0 0 8px ${rarity.color}` : "none" }}>{tr(scroll, "name")}</div>
                    <div style={{ fontSize: 10, color: "#5a4020", marginTop: 3, lineHeight: 1.5 }}>
                      {L("攻", "ATK")}{scroll.attack} {L("防", "DEF")}{scroll.defense} HP{scroll.hp}
                      {scroll.heal > 0 && <span style={{ color: "#50c890" }}> {L("回復", "Heal", "回复")}{scroll.heal}</span>}
                    </div>
                    {scroll.affixes && scroll.affixes.length > 0 && <div style={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap", marginTop: 3 }}>
                      {scroll.affixes.map((a, i) => <span key={i} style={{ fontSize: 9, color: a.special ? "#c870d0" : "#6aaa6a", background: "rgba(0,0,0,0.4)", padding: "0 3px", borderRadius: 2 }}>{tr(a, "tag")}</span>)}
                    </div>}
                    <div style={{ fontSize: 10, color: statusTextColor, marginTop: 4, fontFamily: "'Cinzel',serif" }}>{statusText}</div>
                  </div>
                );
              })}
            </div>
            {selectedScrolls.length > 0 && <div style={{ margin: "8px 0", padding: "6px 12px", background: "#1a1208", border: "1px solid #3a2a10", borderRadius: 5, fontSize: 12, color: "#c8a848" }}>
              {L(`已選 ${selectedScrolls.length} 名傭兵 · 出發後捲軸將被消耗`, `${selectedScrolls.length} merc(s) selected · scrolls consumed on deploy`, `已选 ${selectedScrolls.length} 名佣兵 · 出发后卷轴将被消耗`)}
            </div>}
          </div>
        )}

        <div className="dr" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(165px,1fr))" }}>
          {mercDungeonCards.map(({ dungeon, enemyGroups, isLocked, onStart, style, tierColor }) => {
            return (
              <div key={dungeon.id} className={`dc${isLocked ? " lk" : ""}`} onClick={onStart}
                style={style}>
                <div className="di">{dungeon.icon}</div>
                <div className="dtl" style={{ color: tierColor }}>{tr(dungeon, "label")}</div>
                <div className="dn" style={{ fontSize: 11, color: tierColor }}>{tr(dungeon, "lore").slice(0, 20)}…</div>
                <div style={{ fontSize: 11, margin: "4px 0", letterSpacing: 1 }}>
                  {enemyGroups.map((wave: any) => (
                    <span key={wave.key} style={{ marginRight: 3, opacity: 0.7 }}>
                      {wave.enemies}
                    </span>
                  ))}
                  <span style={{ color: "#c84040", marginLeft: 2 }}>{dungeon.boss && dungeon.boss.icon}Boss</span>
                </div>
                <div className="drq">Lv.{dungeon.minLv}{isLocked ? " 🔒" : ""}</div>
                <div className="drw">EXP×{dungeon.reward.expMult} {L("金", "G")}×{dungeon.reward.goldMult}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
