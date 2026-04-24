import "./game.css";

import { HpBar } from "../components/HpBar";
import { ItemCard } from "../components/ItemCard";
import { LootPopup } from "../components/LootPopup";
import { StoryModal } from "../components/StoryModal/StoryModal";
import { ArenaTab } from "../features/arena/ArenaTab";
import { BattleReport } from "../features/battle/BattleReport";
import { DungeonTab } from "../features/dungeon/DungeonTab";
import { InventoryTab } from "../features/inventory/InventoryTab";
import { QuestTab } from "../features/quests/QuestTab";
import { ShopTab } from "../features/shop/ShopTab";
import { TavernPage } from "../features/tavern/TavernPage";
import { TrainTab } from "../features/train/TrainTab";
import { useGameState } from "./useGameState";

export default function GameApp() {
  const state = useGameState();
  const {
    acceptTavernQuestAction,
    abandonTavernQuestAction,
    arenaInjuredUntil,
    arenaOpponents,
    arenaRefresh,
    arenaRefreshes,
    auctionDisplayItems,
    collectQuest,
    discardLoot,
    addFreeMercScroll,
    claimTavernQuestAction,
    dungeonSections,
    dismissTavernStory,
    equipmentSidebarItems,
    enhanceAnim,
    enhanceLog,
    equipLootNow,
    expeditionCards,
    expPct,
    closeReplay,
    initArena,
    inventory,
    inventoryFilterOptions,
    inventoryItems,
    hasSellableInventory,
    lootDrop,
    mercDungeonCards,
    mercSelectionCards,
    mercScrollsInInv,
    navTabs,
    openBattleReport,
    player,
    potionShopItems,
    questNotify,
    refreshShopCost,
    renderedQuestState,
    refreshAuction,
    refreshShop,
    replay,
    replaySummary,
    recovery,
    refreshTavern,
    restAtInn,
    reset,
    restartReplayBattle,
    save,
    saveMsg,
    selectedScrolls,
    sellListItems,
    sellThreshold,
    setSellThreshold,
    sellJunk,
    shopDisplayItems,
    shopTab,
    shopFilterOptions,
    shopTabOptions,
    sortInventory,
    skipReplay,
    startArenaBattle,
    tAtk,
    tDef,
    trainingCards,
    tMhp,
    tSpd,
    tavernQuestState,
    tavernRestCost,
    tab,
    takeLoot,
    wCat,
    enhanceItems,
  } = state;

  return (
    <>
      <div className="gw">
        <header className="gh">
          <div className="gt">⚔ GLADIUS</div>
          <div className="gd">🪙 {player.gold}</div>
        </header>
        <div className="ml">
          <aside className="sb">
            <div className="pn">
              <div className="ph">角色</div>
              <div className="pb">
                <div className="pname">{player.name}</div>
                <HpBar cur={player.hp} max={tMhp} />
                <div className="bw">
                  <div className="bl"><span>Lv.{player.level}</span><span>{player.exp}/{player.expNeeded}</span></div>
                  <div className="bt"><div className="bf ef" style={{ width: `${expPct}%` }} /></div>
                </div>
                <div style={{ marginTop: 8 }}>
                  {[
                    ["攻擊", tAtk, player.trainedAtk || 0],
                    ["防禦", tDef, player.trainedDef || 0],
                    ["速度", tSpd, player.trainedSpd || 0],
                  ].map(([k, v, trained]) => (
                    <div className="sr" key={k}>
                      <span className="sl">{k}</span>
                      <span className="sv">
                        {v}
                        {trained > 0 && <span style={{ fontSize: 10, color: "#4caf50", marginLeft: 3 }}>+{trained}訓</span>}
                      </span>
                    </div>
                  ))}
                  <div className="sr">
                    <span className="sl">最大HP</span>
                    <span className="sv">
                      {tMhp}
                      {(player.trainedHp || 0) > 0 && <span style={{ fontSize: 10, color: "#c84040", marginLeft: 3 }}>+{(player.trainedHp || 0) * 3}訓</span>}
                    </span>
                  </div>
                </div>
                {wCat && <div className="weapon-trait">{wCat.icon} {wCat.label}：{wCat.traitDesc}</div>}
              </div>
            </div>

            <div className="pn">
              <div className="ph">裝備（點擊卸下）</div>
              <div className="pb" style={{ padding: "8px 10px" }}>
                {equipmentSidebarItems.map(({ category, equippedItem, onUnequip, rarityColor, slot, style, textShadow, title }) => {
                  return (
                    <div key={slot.id}
                      onClick={onUnequip}
                      title={title}
                      style={style}>
                      <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{slot.icon}</span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 9, color: "#4a3020", fontFamily: "'Cinzel',serif", letterSpacing: 0.5, lineHeight: 1 }}>{slot.label}</div>
                        {equippedItem ? <>
                          <div style={{
                            fontSize: 11, color: rarityColor, lineHeight: 1.3, marginTop: 1,
                            textShadow,
                            fontFamily: "'Cinzel',serif", letterSpacing: 0.3,
                          }}>{equippedItem.name}</div>
                          <div style={{ fontSize: 10, color: "#6a5030", marginTop: 2, display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {equippedItem.attack > 0 && <span style={{ color: "#c8781e" }}>攻+{equippedItem.attack}</span>}
                            {equippedItem.defense > 0 && <span style={{ color: "#4a9fd4" }}>防+{equippedItem.defense}</span>}
                            {equippedItem.hp > 0 && <span style={{ color: "#c84040" }}>HP+{equippedItem.hp}</span>}
                            {equippedItem.speed > 0 && <span style={{ color: "#4caf50" }}>速+{equippedItem.speed}</span>}
                            {category && <span style={{ color: "#d08030" }}>{category.icon}{category.label}</span>}
                            {equippedItem.itemLevel && <span style={{ color: "#5a4020" }}>Lv{equippedItem.itemLevel}</span>}
                          </div>
                          {equippedItem.affixes && equippedItem.affixes.length > 0 && (
                            <div style={{ marginTop: 2, display: "flex", gap: 3, flexWrap: "wrap" }}>
                              {equippedItem.affixes.map((a: any, i: any) => (
                                <span key={i} style={{ fontSize: 9, color: a.special ? "#c870d0" : "#6aaa6a", background: "rgba(0,0,0,0.3)", padding: "0 3px", borderRadius: 2 }}>
                                  {a.tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </> : <div style={{ fontSize: 10, color: "#2a1808", fontStyle: "italic" }}>空槽</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pn">
              <div className="ph">存檔</div>
              <div className="pb">
                <div className="svr">
                  <button className="btn btp" onClick={save}>💾 存檔</button>
                  <button className="btn btm" onClick={reset}>🔄 重置</button>
                </div>
                {saveMsg && <div className="svi">{saveMsg}</div>}
              </div>
            </div>
          </aside>

          <main>
            <div className="nt">
              {navTabs.map(({ id, label, badgeCount, onSelect }) => {
                return (
                  <button key={id} className={`nb${tab === id ? " active" : ""}`}
                    style={{ position: "relative" }}
                    onClick={onSelect}>
                    {label}
                    {badgeCount > 0 && (
                      <span style={{ position: "absolute", top: 4, right: 4, background: "#c84040", color: "#fff",
                        borderRadius: "8px", padding: "0 4px", fontSize: 9, lineHeight: "14px", fontFamily: "sans-serif" }}>
                        {badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
              {replay && <button className={`nb${tab === "battle" ? " active" : ""}`} onClick={openBattleReport}>{replay.won ? "🏆" : "⚔"} 報告</button>}
            </div>

            <div className="ca">
              {tab === "dungeon" && (
                <DungeonTab
                  expeditionCards={expeditionCards}
                  dungeonSections={dungeonSections}
                  mercScrollsInInv={mercScrollsInInv}
                  mercSelectionCards={mercSelectionCards}
                  selectedScrolls={selectedScrolls}
                  mercDungeonCards={mercDungeonCards}
                  onAddFreeMercScroll={addFreeMercScroll}
                />
              )}

              {tab === "train" && (
                <TrainTab
                  trainingCards={trainingCards}
                  enhanceLog={enhanceLog}
                  enhanceItems={enhanceItems}
                  enhanceAnim={enhanceAnim}
                />
              )}

              {tab === "arena" && <ArenaTab
                player={player}
                arenaOpponents={arenaOpponents}
                arenaInjuredUntil={arenaInjuredUntil}
                arenaRefreshes={arenaRefreshes}
                onRefresh={arenaRefresh}
                onFight={startArenaBattle}
                onInit={initArena}
              />}

              {tab === "quest" && <QuestTab
                player={player}
                inventory={inventory}
                questState={renderedQuestState}
                onCollect={collectQuest}
              />}

              {tab === "tavern" && (
                <TavernPage
                  player={{ hp: player.hp, maxHp: tMhp }}
                  recovery={recovery}
                  restCost={tavernRestCost}
                  board={tavernQuestState.board}
                  activeQuestId={tavernQuestState.activeQuestId}
                  accepted={tavernQuestState.accepted}
                  progress={tavernQuestState.progress}
                  onRest={restAtInn}
                  onRefresh={refreshTavern}
                  onAcceptQuest={acceptTavernQuestAction}
                  onClaimQuest={claimTavernQuestAction}
                  onAbandonQuest={abandonTavernQuestAction}
                />
              )}

              {tab === "battle" && (
                <BattleReport
                  replay={replay}
                  replaySummary={replaySummary}
                  onClose={closeReplay}
                  onRestart={restartReplayBattle}
                  onSkip={skipReplay}
                />
              )}

              {tab === "shop" && (
                <ShopTab
                  playerGold={player.gold}
                  playerLevel={player.level}
                  shopTab={shopTab}
                  shopTabOptions={shopTabOptions}
                  refreshShop={refreshShop}
                  refreshAuction={refreshAuction}
                  refreshShopCost={refreshShopCost}
                  shopFilterOptions={shopFilterOptions}
                  potionShopItems={potionShopItems}
                  shopDisplayItems={shopDisplayItems}
                  auctionDisplayItems={auctionDisplayItems}
                  hasSellableInventory={hasSellableInventory}
                  sellListItems={sellListItems}
                  sellThreshold={sellThreshold}
                  onSellThresholdChange={setSellThreshold}
                  sortInventory={sortInventory}
                  sellJunk={sellJunk}
                />
              )}

              {tab === "inventory" && (
                <InventoryTab
                  inventoryCount={inventory.length}
                  inventoryFilterOptions={inventoryFilterOptions}
                  isEmpty={inventoryItems.length === 0}
                  inventoryItems={inventoryItems}
                  onSortInventory={sortInventory}
                  onSellJunk={() => sellJunk("normal")}
                />
              )}
            </div>
          </main>
        </div>

        {questNotify && (
          <div className="quest-notify">
            {questNotify.split("\n").map((line, i) => (
              <div key={i} style={{ marginBottom: i === 0 ? 4 : 0 }}>{line}</div>
            ))}
          </div>
        )}

        {tavernQuestState.storyReward && (
          <StoryModal story={tavernQuestState.storyReward} onDismiss={dismissTavernStory} />
        )}

        {lootDrop && <LootPopup
          item={lootDrop}
          onEquip={equipLootNow}
          onTake={takeLoot}
          onDiscard={discardLoot}
        />}
      </div>
    </>
  );
}
