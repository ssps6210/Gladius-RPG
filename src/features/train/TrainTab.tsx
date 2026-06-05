import { ENHANCE_LEVELS } from "../../game/data/enhanceLevels";
import { useLanguage } from "../../game/i18n/LanguageContext";

type GameState = ReturnType<typeof import("../../game/useGameState").useGameState>;

type TrainTabProps = {
  trainingCards: GameState["trainingCards"];
  enhanceLog: GameState["enhanceLog"];
  enhanceItems: GameState["enhanceItems"];
  enhanceAnim: GameState["enhanceAnim"];
  synthesisCards: any[];
  synthesisGoldCost: number;
  synthesisLog: string[];
  synthesisResult: any;
  synthesisUids: any[];
  doSynthesize: () => void;
  toggleSynthesisUid: (uid: any) => void;
};

export function TrainTab({ trainingCards, enhanceLog, enhanceItems, enhanceAnim, synthesisCards, synthesisGoldCost, synthesisLog, synthesisResult, synthesisUids, doSynthesize, toggleSynthesisUid }: TrainTabProps) {
  const { t, tr, L } = useLanguage();
  return (
    <div>
      <div className="stl">{t("trainHall")} <span style={{ color: "#6a5030", fontSize: 13 }}>{t("trainSub")}</span></div>
      <div style={{ padding: "8px 12px", background: "#120e06", border: "1px solid #2a1a08", borderRadius: 5, fontSize: 12, color: "#6a5030", marginBottom: 16, lineHeight: 1.7 }}>
        {t("trainDesc2")}<br />
        <span style={{ color: "#c8961e" }}>{t("trainSafe")}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {trainingCards.map((card) => {
          return (
            <div key={card.id} style={{
              background: `linear-gradient(160deg,${card.color}0a,#141008)`,
              border: `1px solid ${card.color}44`,
              borderRadius: 6, padding: "14px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{card.icon}</span>
                <div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: card.color }}>{card.label}</div>
                  <div style={{ fontSize: 11, color: "#5a4020" }}>{card.desc}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#7a6040", marginBottom: 4 }}>{card.effect}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, color: card.color }}>
                  {card.displayValue}
                  <span style={{ fontSize: 10, color: "#5a4020", marginLeft: 4 }}>{L(`（基礎+${card.current}訓練）`, ` (base +${card.current} trained)`)}</span>
                </div>
                <div style={{ fontSize: 12, color: card.canAfford ? "#f0c040" : "#c84040" }}>🪙{card.cost}</div>
              </div>
              <div style={{ height: 4, background: "#1a1208", borderRadius: 2, marginBottom: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", width: card.progressWidth, background: card.color, borderRadius: 2, transition: "width .4s" }} />
              </div>
              <button className="btn btp" style={{ width: "100%", fontSize: 11 }}
                onClick={card.onTrain}
                disabled={!card.canAfford}>
                {card.trainLabel}
              </button>
            </div>
          );
        })}
      </div>

      <div className="sub">{t("enhTitle2")}</div>
      <div style={{ padding: "8px 12px", background: "#120e06", border: "1px solid #2a1a08", borderRadius: 5, fontSize: 12, color: "#6a5030", marginBottom: 12, lineHeight: 1.7 }}>
        {t("enhDesc1")} <span style={{ color: "#e07020" }}>+10</span>。<br />
        {L("+1~+3 失敗維持原級，+4以上失敗降一級（不追加扣費）。", "+1~+3 keeps level on fail; +4 and up drops one level on fail (no extra cost).")}<br />
        <span style={{ color: "#4caf50" }}>{t("enhDesc2")}</span>
      </div>

      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
        {ENHANCE_LEVELS.map((l) => (
          <div key={l.lv} style={{
            textAlign: "center", padding: "4px 6px",
            background: `rgba(200,150,30,${l.rate * 0.15})`,
            border: `1px solid rgba(200,150,30,${l.rate * 0.4})`,
            borderRadius: 3, minWidth: 50,
          }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, color: "#c8961e" }}>+{l.lv}</div>
            <div style={{ fontSize: 9, color: "#6a5030" }}>{Math.round(l.rate * 100)}%</div>
            <div style={{ fontSize: 9, color: "#4caf50" }}>+{Math.round(l.bonus * 100)}%</div>
          </div>
        ))}
      </div>

      {enhanceLog.length > 0 && (
        <div style={{ background: "#0a0806", border: "1px solid #2a1a08", borderRadius: 4, padding: "8px 10px", marginBottom: 12, maxHeight: 100, overflowY: "auto" }}>
          {enhanceLog.slice(0, 8).map((l, i) => (
            <div key={i} style={{ fontSize: 11, color: l.includes("✨") ? "#4caf50" : l.includes("💔") ? "#c84040" : l.includes("⚠️") ? "#e07020" : "#8a7050", marginBottom: 2 }}>{l}</div>
          ))}
        </div>
      )}

      <div style={{ fontSize: 11, color: "#6a5030", marginBottom: 8, fontFamily: "'Cinzel',serif", letterSpacing: 1 }}>{t("enhSelect")}</div>
      <div className="ig">
        {enhanceItems.map(({ canAfford, cost, curLv, enhColor, isEquipped, isMax, isSelected, item, lvData, rar, select, triggerEnhance }) => {
          return (
            <div key={item.uid} className="ii"
              onClick={select}
              style={{
                borderColor: isSelected ? "#c8961e" : rar.color + (curLv > 0 ? "88" : "33"),
                background: isSelected ? "linear-gradient(160deg,#2a1e08,#1a1208)" : `linear-gradient(160deg,${rar.color}08,#120e06)`,
                cursor: "pointer",
                boxShadow: isSelected ? "0 0 16px rgba(200,150,30,.3)" : rar.glow || "none",
              }}>
              <div className="iii" style={{ filter: `drop-shadow(0 2px 4px ${rar.color}66)` }}>{item.icon}</div>
              {curLv > 0 && (
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: enhColor, marginBottom: 3, textShadow: `0 0 8px ${enhColor}` }}>
                  +{curLv}{isMax ? " MAX" : ""}
                </div>
              )}
              {rar.id !== "normal" && <div className="rb" style={{ color: rar.color, borderColor: rar.color + "55", background: `${rar.color}15` }}>{tr(rar, "label")}</div>}
              <div className="iin" style={{ color: rar.color }}>{tr(item, "name")}</div>
              {isEquipped && <div style={{ fontSize: 9, color: "#c8781e", marginBottom: 2 }}>{t("enhEquipped")}</div>}
              <div className="iis">
                {item.attack > 0 && <div style={{ color: "#c8781e" }}>{L("攻", "ATK")}+{item.attack}</div>}
                {item.defense > 0 && <div style={{ color: "#4a9fd4" }}>{L("防", "DEF")}+{item.defense}</div>}
                {item.hp > 0 && <div style={{ color: "#c84040" }}>HP+{item.hp}</div>}
              </div>
              {!isMax && lvData && (
                <div style={{ fontSize: 10, color: "#5a4020", margin: "4px 0", lineHeight: 1.5 }}>
                  {L(`下一級：成功率 ${Math.round(lvData.rate * 100)}%`, `Next: ${Math.round(lvData.rate * 100)}% success`)}<br />
                  {L("費用", "Cost")} 🪙{cost}
                </div>
              )}
              {isSelected && !isMax && (
                <button className="btn btp"
                  style={{ width: "100%", fontSize: 10,
                    animation: enhanceAnim === "success" ? "none" : enhanceAnim === "fail" ? "shake .3s" : "none",
                    background: enhanceAnim === "success" ? "linear-gradient(135deg,#1a6a1a,#1a4a1a)" :
                      enhanceAnim === "fail" ? "linear-gradient(135deg,#6a1a1a,#4a0e0e)" : "",
                  }}
                  disabled={!canAfford}
                  onClick={triggerEnhance}>
                  {canAfford ? L(`⚒ 強化 +${curLv}→+${curLv + 1}`, `⚒ Enhance +${curLv}→+${curLv + 1}`) : L(`金幣不足 (需${cost})`, `Need ${cost} gold`)}
                </button>
              )}
              {isMax && <div style={{ fontSize: 10, color: "#e07020", fontFamily: "'Cinzel',serif" }}>{t("enhMax")}</div>}
            </div>
          );
        })}
      </div>
      {/* 鍛造合成區塊 */}
      <div className="sub" style={{ marginTop: 24 }}>{t("synthTitle")}</div>
      <div style={{ padding: "8px 12px", background: "#120e06", border: "1px solid #2a1a08", borderRadius: 5, fontSize: 12, color: "#6a5030", marginBottom: 12, lineHeight: 1.7 }}>
        {L("選擇 2~3 件裝備進行合成，有機會提升稀有度！", "Select 2~3 items to synthesize for a chance to raise rarity!")}<br />
        {L(`合成消耗 🪙${synthesisGoldCost || "—"} 金幣（每件 30×等級）`, `Cost 🪙${synthesisGoldCost || "—"} gold (30×level each)`)}<br />
        <span style={{ color: "#9c50d4" }}>{L("稀有度提升機率：2件20%、3件50%，附魔裝備加成", "Upgrade chance: 2pc 20%, 3pc 50%, +bonus from affixed gear")}</span>
      </div>

      {synthesisLog.length > 0 && (
        <div style={{ background: "#0a0806", border: "1px solid #2a1a08", borderRadius: 4, padding: "8px 10px", marginBottom: 12, maxHeight: 80, overflowY: "auto" }}>
          {synthesisLog.slice(0, 5).map((l, i) => (
            <div key={i} style={{ fontSize: 11, color: l.includes("🎉") ? "#e07020" : l.includes("✅") ? "#4caf50" : "#8a7050", marginBottom: 2 }}>{l}</div>
          ))}
        </div>
      )}

      {synthesisResult && (
        <div style={{
          background: `linear-gradient(160deg,${synthesisResult.rarityColor || "#c8c8b0"}15,#141008)`,
          border: `1px solid ${synthesisResult.rarityColor || "#c8c8b0"}66`,
          borderRadius: 6, padding: "12px", marginBottom: 12,
          boxShadow: synthesisResult.rarityGlow || "none",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 10, color: "#5a4020", marginBottom: 4 }}>{L("合成結果", "Result")}</div>
          <div style={{ fontSize: 22, marginBottom: 4 }}>{synthesisResult.icon}</div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, color: synthesisResult.rarityColor || "#c8c8b0", marginBottom: 4 }}>{tr(synthesisResult, "name")}</div>
          {synthesisResult.rarity !== "normal" && <div style={{ fontSize: 10, color: synthesisResult.rarityColor, marginBottom: 4 }}>{tr(synthesisResult, "rarityLabel")}</div>}
          <div style={{ fontSize: 11, color: "#7a6040", display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {synthesisResult.attack > 0 && <span style={{ color: "#c8781e" }}>{L("攻", "ATK")}+{synthesisResult.attack}</span>}
            {synthesisResult.defense > 0 && <span style={{ color: "#4a9fd4" }}>{L("防", "DEF")}+{synthesisResult.defense}</span>}
            {synthesisResult.hp > 0 && <span style={{ color: "#c84040" }}>HP+{synthesisResult.hp}</span>}
            {synthesisResult.speed > 0 && <span style={{ color: "#4caf50" }}>{L("速", "SPD")}+{synthesisResult.speed}</span>}
          </div>
          {synthesisResult.affixes && synthesisResult.affixes.length > 0 && (
            <div style={{ marginTop: 4, display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
              {synthesisResult.affixes.map((a: any, idx: number) => (
                <span key={idx} style={{ fontSize: 9, color: a.special ? "#c870d0" : "#6aaa6a", background: "rgba(0,0,0,0.3)", padding: "1px 4px", borderRadius: 2 }}>{tr(a, "tag")}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {synthesisUids.length > 0 && (
        <div style={{ marginBottom: 8, fontSize: 11, color: "#c8961e", textAlign: "center" }}>
          {L(`已選擇 ${synthesisUids.length}/3 件 · 費用 🪙${synthesisGoldCost}`, `Selected ${synthesisUids.length}/3 · Cost 🪙${synthesisGoldCost}`)}
        </div>
      )}

      <button
        className="btn btp"
        style={{ width: "100%", fontSize: 12, marginBottom: 12, padding: "8px 0" }}
        disabled={synthesisUids.length < 2}
        onClick={doSynthesize}>
        {synthesisUids.length < 2 ? L("至少選擇 2 件裝備", "Select at least 2 items") : L(`🔮 合成 (${synthesisUids.length}件, 🪙${synthesisGoldCost})`, `🔮 Synthesize (${synthesisUids.length}, 🪙${synthesisGoldCost})`)}
      </button>

      <div style={{ fontSize: 11, color: "#6a5030", marginBottom: 8, fontFamily: "'Cinzel',serif", letterSpacing: 1 }}>{t("synthPick")}</div>
      <div className="ig">
        {synthesisCards.map(({ item, rar, selected, onToggle }) => (
          <div key={item.uid} className="ii"
            onClick={onToggle}
            style={{
              borderColor: selected ? "#c8961e" : rar.color + "33",
              background: selected ? "linear-gradient(160deg,#2a1e08,#1a1208)" : `linear-gradient(160deg,${rar.color}08,#120e06)`,
              cursor: "pointer",
              boxShadow: selected ? "0 0 16px rgba(200,150,30,.3)" : "none",
            }}>
            <div className="iii" style={{ filter: `drop-shadow(0 2px 4px ${rar.color}66)` }}>{item.icon}</div>
            {rar.id !== "normal" && <div className="rb" style={{ color: rar.color, borderColor: rar.color + "55", background: `${rar.color}15` }}>{tr(rar, "label")}</div>}
            <div className="iin" style={{ color: rar.color }}>{tr(item, "name")}</div>
            <div className="iis">
              {item.attack > 0 && <div style={{ color: "#c8781e" }}>{L("攻", "ATK")}+{item.attack}</div>}
              {item.defense > 0 && <div style={{ color: "#4a9fd4" }}>{L("防", "DEF")}+{item.defense}</div>}
              {item.hp > 0 && <div style={{ color: "#c84040" }}>HP+{item.hp}</div>}
            </div>
            {item.affixes && item.affixes.length > 0 && (
              <div style={{ marginTop: 2, display: "flex", gap: 3, flexWrap: "wrap" }}>
                {item.affixes.map((a: any, idx: number) => (
                  <span key={idx} style={{ fontSize: 9, color: a.special ? "#c870d0" : "#6aaa6a", background: "rgba(0,0,0,0.3)", padding: "0 3px", borderRadius: 2 }}>{tr(a, "tag")}</span>
                ))}
              </div>
            )}
            <div style={{ fontSize: 10, color: selected ? "#c8961e" : "#5a4020", marginTop: 4 }}>
              {selected ? L("✓ 已選入合成", "✓ Selected") : L("點擊選入", "Click to select")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
