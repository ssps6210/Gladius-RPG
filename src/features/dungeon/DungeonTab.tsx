type GameState = ReturnType<typeof import("../../game/useGameState").useGameState>;

type DungeonTabProps = {
  expeditionCards: GameState["expeditionCards"];
  dungeonSections: GameState["dungeonSections"];
  mercScrollsInInv: GameState["mercScrollsInInv"];
  mercSelectionCards: GameState["mercSelectionCards"];
  selectedScrolls: GameState["selectedScrolls"];
  mercDungeonCards: GameState["mercDungeonCards"];
  onAddFreeMercScroll: GameState["addFreeMercScroll"];
};

export function DungeonTab({
  expeditionCards,
  dungeonSections,
  mercScrollsInInv,
  mercSelectionCards,
  selectedScrolls,
  mercDungeonCards,
  onAddFreeMercScroll,
}: DungeonTabProps) {
  return (
    <div>
      <div className="sub">🗺 探險 — 單怪快速戰鬥</div>
      <div style={{ fontSize: 12, color: "#5a4020", marginBottom: 10, fontStyle: "italic" }}>
        挑戰單一怪物，風險低、速度快，是練等與賺金的好選擇。
      </div>
      <div className="dr" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(135px,1fr))" }}>
        {expeditionCards.map(({ expedition, icon, isLocked, monsterName, onStart, style, traitDesc }) => {
          return (
            <div key={expedition.id} className={`dc${isLocked ? " lk" : ""}`} onClick={onStart}
              style={style}>
              <div className="di">{icon}</div>
              <div className="dn" style={{ fontSize: 11 }}>{expedition.name}</div>
              <div style={{ fontSize: 10, color: "#8a6a30", marginBottom: 3, fontStyle: "italic" }}>{monsterName}</div>
              <div style={{ fontSize: 10, color: "#c8781e", marginBottom: 4 }}>{traitDesc}</div>
              <div className="drq">Lv.{expedition.minLv}{isLocked ? " 🔒" : ""}</div>
              <div className="drw">EXP×{expedition.expMult} 金×{expedition.goldMult}{expedition.lootBonus > 0 && <span style={{ color: "#4caf50" }}> +{Math.round(expedition.lootBonus * 100)}%</span>}</div>
            </div>
          );
        })}
      </div>

      <div className="sub" style={{ marginTop: 24 }}>⚔️ 副本 — 多波怪物＋Boss</div>
      <div style={{ fontSize: 12, color: "#5a4020", marginBottom: 10, fontStyle: "italic" }}>
        挑戰完整副本：三波怪物加上強力Boss，掉落更豐厚。
      </div>
      {dungeonSections.map(d => (
        <div className="dz" key={d.id}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>{d.icon}</span>
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: "#c8961e", letterSpacing: 1 }}>{d.name} <span style={{ fontSize: 10, color: "#5a4020" }}>Lv.{d.minLv}+</span></div>
              <div style={{ fontSize: 11, color: "#6a5030", fontStyle: "italic" }}>{d.lore}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            {d.waveBadges.map((wave: any, wi: number) => (
              <div key={wi} style={{ fontSize: 10, color: "#5a4030", background: "rgba(0,0,0,0.3)", border: "1px solid #2a1a08", borderRadius: 3, padding: "2px 6px" }}>
                {wave.enemies} {wave.label}
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
                  <div className="dtl" style={{ color: tier.color }}>{tier.label}</div>
                  <div className="dn" style={{ fontSize: 11, color: tier.color }}>{d.name}</div>
                  <div className="drq">Lv.{req}{isLocked ? " 🔒" : ""}</div>
                  <div className="drw">EXP×{tier.expMult} 金×{tier.goldMult}{tier.lootBonus > 0 && <span style={{ color: "#d4b84a" }}> +{Math.round(tier.lootBonus * 100)}%</span>}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="dz">
        <div className="sub">🏴 傭兵副本 — 契約捲軸系統</div>
        <div style={{ marginBottom: 10, padding: "8px 12px", background: "#120e06", border: "1px solid #2a1a08", borderRadius: 5, fontSize: 12, color: "#6a5030", lineHeight: 1.7 }}>
          從探險和副本中掉落<span style={{ color: "#e07020" }}>傭兵契約捲軸</span>，在背包中選取後出發。<br />
          捲軸稀有度越高，傭兵越強，詞條加成越多。捲軸使用後消耗。
        </div>

        {mercScrollsInInv.length === 0 ? (
          <div style={{ padding: "12px", background: "rgba(0,0,0,0.3)", border: "1px solid #2a1a08", borderRadius: 4, fontSize: 12, color: "#4a3020", textAlign: "center", marginBottom: 10 }}>
            背包中沒有傭兵契約捲軸<br />
            <span style={{ fontSize: 11, color: "#3a2818" }}>探險和副本Boss有機率掉落</span>
            <div style={{ marginTop: 8 }}>
              <button className="btn btm" style={{ fontSize: 10 }} onClick={onAddFreeMercScroll}>🎲 購買隨機捲軸（免費測試）</button>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "#6a5030", marginBottom: 6, fontFamily: "'Cinzel',serif" }}>選擇傭兵（點擊勾選）：</div>
            <div className="mg" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))" }}>
              {mercSelectionCards.map(({ onToggle, rarity, scroll, selected, statusText, statusTextColor, style }) => {
                return (
                  <div key={scroll.uid}
                    style={style}
                    onClick={onToggle}>
                    <div style={{ fontSize: 22, filter: `drop-shadow(0 2px 6px ${rarity.color}88)` }}>{scroll.icon}</div>
                    <div style={{ fontSize: 9, color: rarity.color, fontFamily: "'Cinzel',serif", borderColor: `${rarity.color}55`, border: "1px solid", borderRadius: 2, padding: "1px 4px", display: "inline-block", margin: "3px 0" }}>{rarity.label}</div>
                    <div style={{ fontSize: 11, color: rarity.color, fontFamily: "'Cinzel',serif", letterSpacing: 0.3, textShadow: rarity.glow ? `0 0 8px ${rarity.color}` : "none" }}>{scroll.name}</div>
                    <div style={{ fontSize: 10, color: "#5a4020", marginTop: 3, lineHeight: 1.5 }}>
                      攻{scroll.attack} 防{scroll.defense} HP{scroll.hp}
                      {scroll.heal > 0 && <span style={{ color: "#50c890" }}> 回{scroll.heal}</span>}
                    </div>
                    {scroll.affixes && scroll.affixes.length > 0 && <div style={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap", marginTop: 3 }}>
                      {scroll.affixes.map((a, i) => <span key={i} style={{ fontSize: 9, color: a.special ? "#c870d0" : "#6aaa6a", background: "rgba(0,0,0,0.4)", padding: "0 3px", borderRadius: 2 }}>{a.tag}</span>)}
                    </div>}
                    <div style={{ fontSize: 10, color: statusTextColor, marginTop: 4, fontFamily: "'Cinzel',serif" }}>{statusText}</div>
                  </div>
                );
              })}
            </div>
            {selectedScrolls.length > 0 && <div style={{ margin: "8px 0", padding: "6px 12px", background: "#1a1208", border: "1px solid #3a2a10", borderRadius: 5, fontSize: 12, color: "#c8a848" }}>
              已選 {selectedScrolls.length} 名傭兵 · 出發後捲軸將被消耗
            </div>}
          </div>
        )}

        <div className="dr" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(165px,1fr))" }}>
          {mercDungeonCards.map(({ dungeon, enemyGroups, isLocked, onStart, style, tierColor }) => {
            return (
              <div key={dungeon.id} className={`dc${isLocked ? " lk" : ""}`} onClick={onStart}
                style={style}>
                <div className="di">{dungeon.icon}</div>
                <div className="dtl" style={{ color: tierColor }}>{dungeon.label}</div>
                <div className="dn" style={{ fontSize: 11, color: tierColor }}>{dungeon.lore.slice(0, 20)}…</div>
                <div style={{ fontSize: 11, margin: "4px 0", letterSpacing: 1 }}>
                  {enemyGroups.map((wave: any) => (
                    <span key={wave.key} style={{ marginRight: 3, opacity: 0.7 }}>
                      {wave.enemies}
                    </span>
                  ))}
                  <span style={{ color: "#c84040", marginLeft: 2 }}>{dungeon.boss && dungeon.boss.icon}Boss</span>
                </div>
                <div className="drq">Lv.{dungeon.minLv}{isLocked ? " 🔒" : ""}</div>
                <div className="drw">EXP×{dungeon.reward.expMult} 金×{dungeon.reward.goldMult}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
