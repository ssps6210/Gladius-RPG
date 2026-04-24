import { ENHANCE_LEVELS } from "../../game/data/enhanceLevels";

type GameState = ReturnType<typeof import("../../game/useGameState").useGameState>;

type TrainTabProps = {
  trainingCards: GameState["trainingCards"];
  enhanceLog: GameState["enhanceLog"];
  enhanceItems: GameState["enhanceItems"];
  enhanceAnim: GameState["enhanceAnim"];
};

export function TrainTab({ trainingCards, enhanceLog, enhanceItems, enhanceAnim }: TrainTabProps) {
  return (
    <div>
      <div className="stl">訓練場 <span style={{ color: "#6a5030", fontSize: 13 }}>- 永久提升屬性</span></div>
      <div style={{ padding: "8px 12px", background: "#120e06", border: "1px solid #2a1a08", borderRadius: 5, fontSize: 12, color: "#6a5030", marginBottom: 16, lineHeight: 1.7 }}>
        花費金幣永久提升基礎屬性。費用隨等級與已訓練次數增加。<br />
        <span style={{ color: "#c8961e" }}>保護機制：訓練不會讓金幣低於 50。</span>
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
                  <span style={{ fontSize: 10, color: "#5a4020", marginLeft: 4 }}>（基礎+{card.current}訓練）</span>
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

      <div className="sub">⚒ 裝備強化 - 提升裝備屬性</div>
      <div style={{ padding: "8px 12px", background: "#120e06", border: "1px solid #2a1a08", borderRadius: 5, fontSize: 12, color: "#6a5030", marginBottom: 12, lineHeight: 1.7 }}>
        選擇裝備強化，最高 <span style={{ color: "#e07020" }}>+10</span>。<br />
        +1~+3 失敗維持原級，+4以上失敗降一級（不追加扣費）。<br />
        <span style={{ color: "#4caf50" }}>金幣只在嘗試時扣除，失敗不會雙重懲罰。</span>
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
            <div key={i} style={{ fontSize: 11, color: l.includes("成功") ? "#4caf50" : l.includes("失敗") ? "#c84040" : l.includes("最高") ? "#e07020" : "#8a7050", marginBottom: 2 }}>{l}</div>
          ))}
        </div>
      )}

      <div style={{ fontSize: 11, color: "#6a5030", marginBottom: 8, fontFamily: "'Cinzel',serif", letterSpacing: 1 }}>選擇要強化的裝備：</div>
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
              {rar.id !== "normal" && <div className="rb" style={{ color: rar.color, borderColor: rar.color + "55", background: `${rar.color}15` }}>{rar.label}</div>}
              <div className="iin" style={{ color: rar.color }}>{item.name}</div>
              {isEquipped && <div style={{ fontSize: 9, color: "#c8781e", marginBottom: 2 }}>⚔ 已裝備</div>}
              <div className="iis">
                {item.attack > 0 && <div style={{ color: "#c8781e" }}>攻+{item.attack}</div>}
                {item.defense > 0 && <div style={{ color: "#4a9fd4" }}>防+{item.defense}</div>}
                {item.hp > 0 && <div style={{ color: "#c84040" }}>HP+{item.hp}</div>}
              </div>
              {!isMax && lvData && (
                <div style={{ fontSize: 10, color: "#5a4020", margin: "4px 0", lineHeight: 1.5 }}>
                  下一級：成功率 {Math.round(lvData.rate * 100)}%<br />
                  費用 🪙{cost}
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
                  {canAfford ? `⚒ 強化 +${curLv}→+${curLv + 1}` : `金幣不足 (需${cost})`}
                </button>
              )}
              {isMax && <div style={{ fontSize: 10, color: "#e07020", fontFamily: "'Cinzel',serif" }}>✦ 已達最高 +10</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
