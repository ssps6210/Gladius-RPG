import { ItemCard } from "../../components/ItemCard";
import { SellThresholdControl } from "./SellThresholdControl";

type GameState = ReturnType<typeof import("../../game/useGameState").useGameState>;

type ShopTabProps = {
  playerGold: GameState["player"]["gold"];
  playerLevel: GameState["player"]["level"];
  shopTab: GameState["shopTab"];
  shopTabOptions: GameState["shopTabOptions"];
  refreshShop: GameState["refreshShop"];
  refreshAuction: GameState["refreshAuction"];
  refreshShopCost: GameState["refreshShopCost"];
  shopFilterOptions: GameState["shopFilterOptions"];
  potionShopItems: GameState["potionShopItems"];
  shopDisplayItems: GameState["shopDisplayItems"];
  auctionDisplayItems: GameState["auctionDisplayItems"];
  hasSellableInventory: GameState["hasSellableInventory"];
  sellListItems: GameState["sellListItems"];
  sellThreshold: GameState["sellThreshold"];
  onSellThresholdChange: GameState["setSellThreshold"];
  sortInventory: GameState["sortInventory"];
  sellJunk: GameState["sellJunk"];
};

export function ShopTab({
  playerGold,
  playerLevel,
  shopTab,
  shopTabOptions,
  refreshShop,
  refreshAuction,
  refreshShopCost,
  shopFilterOptions,
  potionShopItems,
  shopDisplayItems,
  auctionDisplayItems,
  hasSellableInventory,
  sellListItems,
  sellThreshold,
  onSellThresholdChange,
  sortInventory,
  sellJunk,
}: ShopTabProps) {
  return (
    <div>
      <div className="stl">
        商店 <span style={{ color: "#6a5030", fontSize: 13 }}>— 🪙 {playerGold}</span>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, borderBottom: "1px solid #3a2a10", paddingBottom: 8 }}>
        {shopTabOptions.map(({ id, isActive, label, onSelect }) => (
          <button key={id} className={`btn${isActive ? " btp" : " btm"}`} style={{ fontSize: 11, padding: "7px 14px" }} onClick={onSelect}>{label}</button>
        ))}
      </div>

      {shopTab === "buy" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: "#6a5030" }}>商品已依你的等級(Lv.{playerLevel})生成</div>
            <button className="btn btm" style={{ fontSize: 10, padding: "5px 12px" }} onClick={refreshShop}>
              🔄 刷新 (-🪙{refreshShopCost})
            </button>
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
            {shopFilterOptions.map((filter) => {
              return (
                <div key={filter.id} className={`wcat-btn${filter.isActive ? " active" : ""}`} onClick={filter.onSelect}
                  style={{ fontSize: 10, padding: "3px 8px" }}>
                  {filter.label}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {potionShopItems.map((p) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "#1a1208", border: "1px solid #3a2a10", borderRadius: 4, fontSize: 12 }}>
                <span>{p.icon}</span>
                <span style={{ color: "#c8a848" }}>{p.name}</span>
                <span style={{ color: "#50a860" }}>+{p.heal}HP</span>
                <span style={{ color: "#f0c040" }}>🪙{p.cost}</span>
                <button className="btn btp" style={{ fontSize: 10, padding: "4px 10px" }} disabled={!p.canAfford}
                  onClick={p.onBuy}>買</button>
              </div>
            ))}
          </div>
          <div className="sg">
            {shopDisplayItems.map(({ cat, item, onBuy, rarity }, idx) => {
              return (
                <div key={idx} className="si" style={{ borderColor: rarity.color + "55", background: `linear-gradient(160deg,${rarity.color}08,#141008)`, boxShadow: rarity.glow || "none" }}>
                  <div className="sii" style={{ filter: `drop-shadow(0 2px 5px ${rarity.color}66)` }}>{item.icon}</div>
                  <div className="rb" style={{ color: rarity.color, borderColor: rarity.color + "55", background: `${rarity.color}15` }}>{rarity.label}</div>
                  <div className="sin" style={{ color: rarity.color }}>{item.name}</div>
                  {cat && <div className="sit">{cat.icon} {cat.label} · {cat.traitDesc}</div>}
                  <div className="sis">
                    {item.attack > 0 && <div style={{ color: "#c8781e" }}>攻+{item.attack}</div>}
                    {item.defense > 0 && <div style={{ color: "#4a9fd4" }}>防+{item.defense}</div>}
                    {item.hp > 0 && <div style={{ color: "#c84040" }}>HP+{item.hp}</div>}
                    {item.speed > 0 && <div style={{ color: "#4caf50" }}>速+{item.speed}</div>}
                    {item.itemLevel > 0 && <div style={{ color: "#5a4020", fontSize: 10 }}>Lv{item.itemLevel}</div>}
                  </div>
                  {item.affixes && item.affixes.length > 0 && <div className="iaf" style={{ marginBottom: 6 }}>
                    {item.affixes.map((a: any, i: any) => <div key={i} className={`al${a.special ? " as" : ""}`}>
                      {a.stat ? `${a.tag}:+${a.rolledVal}` : a.special === "crit" ? `${a.tag}:${a.rolledVal}%爆擊` : a.special === "lifesteal" ? `${a.tag}:${a.rolledVal}%吸血` : a.tag}
                    </div>)}
                  </div>}
                  <div className="sic">🪙 {item.cost}</div>
                  <button className="btn btp" style={{ width: "100%", fontSize: 10 }} onClick={onBuy} disabled={playerGold < item.cost}>購買</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {shopTab === "auction" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#6a5030" }}>競標高品質裝備，出價最高者得標</div>
            <button className="btn btm" style={{ fontSize: 10, padding: "5px 12px" }} onClick={refreshAuction}>🔄 刷新競標</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {auctionDisplayItems.map(({ cat, iWon, it, minNext, myBid, onBidInputChange, onClaim, onSubmitBid, rar }) => {
              return (
                <div key={it.auctionId} style={{
                  background: `linear-gradient(160deg,${rar.color}08,#141008)`,
                  border: `1px solid ${rar.color}66`,
                  borderRadius: 6, padding: "14px",
                  boxShadow: rar.glow || "none",
                }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ fontSize: 30, filter: `drop-shadow(0 2px 8px ${rar.color}88)` }}>{it.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <div className="rb" style={{ color: rar.color, borderColor: rar.color + "55", background: `${rar.color}15` }}>{rar.label}</div>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: rar.color }}>{it.name}</div>
                        {cat && <div style={{ fontSize: 10, color: "#c8781e" }}>{cat.icon}{cat.label}</div>}
                      </div>
                      <div style={{ fontSize: 11, color: "#6a5030", display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        {it.attack > 0 && <span style={{ color: "#c8781e" }}>攻+{it.attack}</span>}
                        {it.defense > 0 && <span style={{ color: "#4a9fd4" }}>防+{it.defense}</span>}
                        {it.hp > 0 && <span style={{ color: "#c84040" }}>HP+{it.hp}</span>}
                        {it.speed > 0 && <span style={{ color: "#4caf50" }}>速+{it.speed}</span>}
                        {it.itemLevel > 0 && <span style={{ color: "#5a4020" }}>Lv{it.itemLevel}</span>}
                      </div>
                      {it.affixes && it.affixes.length > 0 && <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                        {it.affixes.map((a: any, i: any) => <span key={i} style={{ fontSize: 9, color: a.special ? "#c870d0" : "#6aaa6a", background: "rgba(0,0,0,0.3)", padding: "0 4px", borderRadius: 2 }}>{a.tag}</span>)}
                      </div>}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ fontSize: 12, color: "#f0c040", fontFamily: "'Cinzel',serif" }}>
                          目前出價：🪙{it.currentBid} <span style={{ fontSize: 10, color: "#6a5030" }}>({it.bidCount}人競標)</span>
                        </div>
                        {iWon && <div style={{ fontSize: 11, color: "#4caf50" }}>✓ 目前最高出價</div>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ fontSize: 11, color: "#5a4020" }}>最低加價 🪙{minNext}</div>
                    <input
                      type="number" min={minNext} placeholder={minNext}
                      value={myBid}
                      onChange={onBidInputChange}
                      style={{ width: 90, background: "#0e0a05", border: "1px solid #4a3010", borderRadius: 3, color: "#f0c040", padding: "5px 8px", fontSize: 12, fontFamily: "'Cinzel',serif" }}
                    />
                    <button className="btn btp" style={{ fontSize: 10, padding: "6px 12px" }} onClick={onSubmitBid} disabled={!myBid || myBid < minNext || playerGold < myBid}>出價</button>
                    {iWon && <button className="btn btm" style={{ fontSize: 10, padding: "6px 12px" }} onClick={onClaim}>🎁 領取</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {shopTab === "sell" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ fontSize: 12, color: "#6a5030", flex: 1 }}>出售背包中的裝備，回收金幣</div>
            <button className="btn btm" style={{ fontSize: 10, padding: "6px 12px" }} onClick={sortInventory}>📂 整理背包</button>
            <SellThresholdControl
              value={sellThreshold}
              onChange={onSellThresholdChange}
              onSell={() => sellJunk(sellThreshold)}
            />
          </div>
          {!hasSellableInventory && <div style={{ color: "#4a3a20", fontStyle: "italic" }}>背包中沒有可出售的裝備</div>}
          <div className="ig">
            {sellListItems.map(({ item, onEquip, onSelect, onSell, price, rarity, selectLabel }) => {
              if (item.type === "merc_scroll") {
                return (
                  <div key={item.uid} className="ii" style={{ borderColor: rarity.color + "55", background: `linear-gradient(160deg,${rarity.color}08,#120e06)` }}>
                    <div style={{ fontSize: 20 }}>📜</div>
                    <div className="rb" style={{ color: rarity.color, borderColor: rarity.color + "55", background: `${rarity.color}15` }}>{rarity.label}</div>
                    <div className="iin" style={{ color: rarity.color }}>{item.name}</div>
                    <div className="iis">攻{item.attack} 防{item.defense} HP{item.hp}</div>
                    <div style={{ color: "#f0c040", fontSize: 12, margin: "6px 0" }}>售價 🪙{price}</div>
                    {onSelect && <button className="btn btp" style={{ width: "100%", fontSize: 10, marginBottom: 4 }} onClick={onSelect}>{selectLabel}</button>}
                    <button className="btn btd" style={{ width: "100%", fontSize: 10 }} onClick={onSell}>出售</button>
                  </div>
                );
              }
              return (
                <ItemCard
                  key={item.uid}
                  item={item}
                  onEquip={onEquip}
                  footer={(
                    <>
                      <div style={{ color: "#f0c040", fontSize: 12, margin: "2px 0 0" }}>售價 🪙{price}</div>
                      <button className="btn btd" style={{ width: "100%", fontSize: 10 }} onClick={onSell}>出售</button>
                    </>
                  )}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
