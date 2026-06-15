import "./game.css";
import { useEffect } from "react";

import { HpBar } from "../components/HpBar";
import { AudioSettingsButton } from "../components/AudioSettings/AudioSettingsPanel";
import { playShopEnter } from "./audio";
import { ClassSelectModal } from "../components/ClassSelectModal";
import { ItemCard } from "../components/ItemCard";
import { LootPopup } from "../components/LootPopup";
import { StoryModal } from "../components/StoryModal/StoryModal";
import { ArenaTab } from "../features/arena/ArenaTab";
import { BattleReport } from "../features/battle/BattleReport";
import { DungeonTab } from "../features/dungeon/DungeonTab";
import { DungeonModifierModal } from "../features/dungeon/DungeonModifierModal";
import { InventoryTab } from "../features/inventory/InventoryTab";
import { QuestTab } from "../features/quests/QuestTab";
import { ShopTab } from "../features/shop/ShopTab";
import { TavernPage } from "../features/tavern/TavernPage";
import { TrainTab } from "../features/train/TrainTab";
import { calculateSetBonuses } from "./data/sets";
import { JOB_CLASSES, GLADIATOR_PORTRAIT } from "./data/classes";
import { useLanguage } from "./i18n/LanguageContext";
import { useGameState } from "./useGameState";
import { useTutorial } from "./hooks/useTutorial";
import { TutorialOverlay } from "../components/Tutorial/TutorialOverlay";
import { startBgm, switchBgm } from "./audio";

const BGM_FOR_TAB: Record<string, string> = {
  tavern: "./sounds/bgm_tavern.mp3",
  shop:   "./sounds/bgm_shop.mp3",
  arena:  "./sounds/bgm_arena.mp3",
  train:  "./sounds/bgm_blacksmith.mp3",
};

export default function GameApp({ slot = 1, onExitToMenu }: { slot?: import("./constants/storage").SaveSlot; onExitToMenu?: () => void }) {
  const { t, tr, L, toggleLang } = useLanguage();
  const { tutorialStep, advanceTutorial, skipTutorial, restartTutorial } = useTutorial();
  const state = useGameState(slot);

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
    chooseClass,
    openClassModal,
    closeClassModal,
    classModalOpen,
    goToTavern,
    doPrestige,
    modifierPending,
    confirmModifier,
    cancelModifier,
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
    synthesisCards,
    synthesisGoldCost,
    synthesisLog,
    synthesisResult,
    synthesisUids,
    doSynthesize,
    toggleSynthesisUid,
  } = state;

  useEffect(() => {
    const handler = () => { startBgm(); document.removeEventListener("pointerdown", handler); };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  useEffect(() => {
    if (tab === "battle") {
      const isBoss = !!(replay as any)?.dungeon?.boss;
      switchBgm(isBoss ? "./sounds/bgm_boss.mp3" : "./sounds/bgm_battle.mp3");
    } else {
      switchBgm(BGM_FOR_TAB[tab] ?? "./sounds/bgm.mp3");
    }
  }, [tab, replay]);

  return (
    <>
      <div className="gw">
        <header className="gh">
          <div className="gt">⚔ GLADIUS</div>
          <div className="gh-actions">
            <AudioSettingsButton />
            {(() => {
              const cls = JOB_CLASSES[player.jobClass as keyof typeof JOB_CLASSES];
              const isTier2 = cls?.tier === 2;
              const notYet = player.level < 30 && !player.jobClass;
              const needsAction = (!player.jobClass && player.level >= 30) || (cls?.tier === 1 && player.level >= 70);
              const canOpen = !notYet && !isTier2;
              const label = cls ? `${cls.icon} ${L(cls.name, cls.nameEn)}` : L("⚔ 轉職", "⚔ Class", "⚔ 转职");
              const tip = notYet
                ? L("Lv.30 解鎖轉職", "Unlocks at Lv.30", "Lv.30 解锁转职")
                : isTier2
                  ? L("路徑已鎖定（二轉）", "Path locked (Tier 2)", "路径已锁定（二转）")
                  : needsAction
                    ? (cls?.tier === 1 ? L("Lv.70！可升級二轉！", "Lv.70! Tier 2 available!", "Lv.70！可升级二转！") : L("選擇你的職業！", "Choose your class!", "选择你的职业！"))
                    : L("點擊查看晉升路線", "View advancement", "点击查看晋升路线");
              return (
                <button
                  className={needsAction ? "btn class-btn-ready" : "btn btm"}
                  style={{ fontSize: 11, padding: "4px 8px", opacity: (notYet || isTier2) ? 0.4 : 1, cursor: canOpen ? "pointer" : "not-allowed" }}
                  onClick={canOpen ? openClassModal : undefined}
                  title={tip}
                >
                  {label}
                </button>
              );
            })()}
            {tutorialStep === null && (
              <button className="btn btm gh-tutorial-btn" style={{ fontSize: 10, padding: "3px 7px", opacity: 0.6 }} onClick={restartTutorial} title={L("重新播放新手教學", "Replay tutorial", "重新播放新手教学")}>❓</button>
            )}
            <button className="btn btm" style={{ fontSize: 11, padding: "4px 10px" }} onClick={toggleLang}>🌐 {t("langBtn")}</button>
            <div className="gd">🪙 {player.gold}</div>
          </div>
        </header>
        <div className="ml">
          <aside className="sb">
            <div className="pn">
              <div className="ph">{t("charTitle")}</div>
              <div className="pb">
                {(() => {
                  const cls = JOB_CLASSES[player.jobClass as keyof typeof JOB_CLASSES];
                  const portrait = cls?.portrait || GLADIATOR_PORTRAIT;
                  return (
                    <div style={{ position: "relative", marginBottom: 8, borderRadius: 4, overflow: "hidden" }}>
                      <img
                        src={portrait}
                        alt="character"
                        style={{ width: "100%", aspectRatio: "1", objectFit: "cover", objectPosition: "top", display: "block", opacity: 0.9 }}
                      />
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        background: "linear-gradient(transparent, rgba(0,0,0,0.9))",
                        padding: "20px 8px 6px",
                      }}>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: "#e0c060" }}>{player.name}</div>
                        {cls && <div style={{ fontSize: 10, color: "#a08040" }}>{cls.icon} {L(cls.name, cls.nameEn)}</div>}
                      </div>
                    </div>
                  );
                })()}
                <HpBar cur={player.hp} max={tMhp} />
                <div className="bw">
                  <div className="bl"><span>Lv.{player.level}</span><span>{player.exp}/{player.expNeeded}</span></div>
                  <div className="bt"><div className="bf ef" style={{ width: `${expPct}%` }} /></div>
                </div>
                <div style={{ marginTop: 8 }}>
                  {[
                    [t("statAtk"), tAtk, player.trainedAtk || 0],
                    [t("statDef"), tDef, player.trainedDef || 0],
                    [t("statSpd"), tSpd, player.trainedSpd || 0],
                  ].map(([k, v, trained]) => (
                    <div className="sr" key={k}>
                      <span className="sl">{k}</span>
                      <span className="sv">
                        {v}
                        {trained > 0 && <span style={{ fontSize: 10, color: "#4caf50", marginLeft: 3 }}>+{trained}{t("trained")}</span>}
                      </span>
                    </div>
                  ))}
                  <div className="sr">
                    <span className="sl">{t("statMaxHp")}</span>
                    <span className="sv">
                      {tMhp}
                      {(player.trainedHp || 0) > 0 && <span style={{ fontSize: 10, color: "#c84040", marginLeft: 3 }}>+{(player.trainedHp || 0) * 3}{t("trained")}</span>}
                    </span>
                  </div>
                </div>
                {player.level >= 30 && (
                  <div style={{ marginTop: 8, borderTop: "1px solid #2a1808", paddingTop: 6 }}>
                    {player.jobClass ? (
                      (() => {
                        const cls = JOB_CLASSES[player.jobClass as keyof typeof JOB_CLASSES];
                        const isTier2 = cls?.tier === 2;
                        return cls ? (
                          <div
                            onClick={isTier2 ? undefined : openClassModal}
                            style={{ cursor: isTier2 ? "default" : "pointer", display: "flex", alignItems: "center", gap: 6 }}
                            title={isTier2 ? L("路徑已鎖定（二轉）", "Path locked (Tier 2)", "路径已锁定（二转）") : L("點擊晉升職業", "Click to advance class", "点击晋升职业")}
                          >
                            <span style={{ fontSize: 14 }}>{cls.icon}</span>
                            <span style={{ fontSize: 11, color: "#c8a060", fontFamily: "'Cinzel',serif" }}>
                              {L(cls.name, cls.nameEn)}
                            </span>
                            {isTier2 && <span style={{ fontSize: 9, color: "#4a3020" }}>🔒</span>}
                          </div>
                        ) : null;
                      })()
                    ) : (
                      <button
                        onClick={openClassModal}
                        className="btn btp"
                        style={{ width: "100%", fontSize: 10 }}
                      >
                        {L("⚔ 選擇職業（Lv30解鎖）", "⚔ Choose Class (Lv30)", "⚔ 选择职业（Lv30解锁）")}
                      </button>
                    )}
                  </div>
                )}
                {/* Prestige display + button */}
                {((player.prestige as number) || 0) > 0 && (
                  <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
                    <span style={{ color: "#d4a030" }}>⭐</span>
                    <span style={{ color: "#c8961e", fontFamily: "'Cinzel',serif" }}>
                      {L("轉生", "Prestige", "转生")} ×{(player.prestige as number) || 0}
                    </span>
                    <span style={{ fontSize: 10, color: "#4caf50" }}>
                      (+{((player.prestige as number) || 0) * 5}%)
                    </span>
                  </div>
                )}
                {player.level >= 85 && ((player.prestige as number) || 0) < 10 && (
                  <button
                    className="btn btp"
                    style={{ width: "100%", fontSize: 10, marginTop: 6, background: "linear-gradient(90deg,#8b5a14,#c8961e)", borderColor: "#d4a030" }}
                    onClick={() => {
                      if (confirm(L("確定要轉生嗎？等級歸1、裝備清空，保留訓練值與20%金幣。每轉生一次全屬性+5%。", "Prestige? Level resets to 1, equipment cleared, training kept, 20% gold kept. +5% all stats per prestige.", "确定要转生吗？等级归1、装备清空，保留训练值与20%金币。每转生一次全属性+5%。"))) {
                        doPrestige();
                      }
                    }}
                  >
                    {L("⭐ 轉生（Lv.85）", "⭐ Prestige (Lv.85)", "⭐ 转生（Lv.85）")}
                  </button>
                )}
              </div>
            </div>

            <div className="pn">
              <div className="ph">{t("equipTitle")}{t("clickUnequip")}</div>
              <div className="pb" style={{ padding: "6px 8px" }}>
                <div className="eq-grid">
                  {equipmentSidebarItems.map(({ equippedItem, effectiveness, onUnequip, rarityColor, textShadow, slot, title }) => (
                    <div key={slot.id} className="eq-slot" onClick={onUnequip} title={title}
                      style={equippedItem ? { borderColor: rarityColor + "66", background: rarityColor + "0d" } : undefined}>
                      <span className="eq-icon">{slot.icon}</span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <span className="eq-label">
                          {tr(slot, "label")}
                          {effectiveness && effectiveness < 1 &&
                            <span style={{ color: "#7a5020", marginLeft: 2 }}>({Math.round(effectiveness * 100)}%)</span>}
                        </span>
                        {equippedItem
                          ? <div className="eq-item" style={{ color: rarityColor, textShadow }}>{tr(equippedItem, "name")}</div>
                          : <div className="eq-empty">—</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {(() => {
              const setBonuses = calculateSetBonuses(player.equipment || {});
              if (setBonuses.length === 0) return null;
              return (
                <div className="pn">
                  <div className="ph">{t("setEffectTitle")}</div>
                  <div className="pb" style={{ padding: "8px 10px" }}>
                    {setBonuses.map(({ set, activePieces, allBonuses }) => {
                      const totalPieces = set.itemNames.length;
                      const equippedNames = set.itemNames.filter(name =>
                        Object.values(player.equipment || {}).some((e: any) => e?.name === name)
                      );
                      return (
                        <div key={set.id} style={{ marginBottom: 8, borderBottom: "1px solid #2a1a08", paddingBottom: 6 }}>
                          <div style={{ fontSize: 12, color: "#e0c060", fontWeight: "bold", marginBottom: 3 }}>
                            {set.icon} {tr(set, "name")}
                            <span style={{ fontSize: 10, color: "#8a7050", fontWeight: "normal", marginLeft: 4 }}>
                              ({activePieces}/{totalPieces})
                            </span>
                          </div>
                          <div style={{ fontSize: 10, color: "#6a5030", marginBottom: 4, fontStyle: "italic" }}>
                            {tr(set, "description")}
                          </div>
                          {allBonuses.map((bonus, i) => (
                            <div key={i} style={{ fontSize: 10, color: "#4caf50", marginBottom: 2 }}>
                              ✦ {bonus.pieces}{L("件", "pc")}: {tr(bonus, "description")}
                            </div>
                          ))}
                          {activePieces < totalPieces && (
                            <div style={{ fontSize: 9, color: "#4a3020", marginTop: 3 }}>
                              {L("未裝備", "Missing", "未装备")}: {set.itemNames.filter(name => !equippedNames.includes(name)).join(L("、", ", "))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            <div className="pn">
              <div className="ph">{t("saveLabel")}</div>
              <div className="pb">
                <div className="svr">
                  <button className="btn btp" onClick={save}>{t("saveBtn")}</button>
                  <button className="btn btm" onClick={() => { reset(); onExitToMenu?.(); }}>{t("resetBtn")}</button>
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
                    data-tutorial={id}
                    onClick={() => { if (id === "shop" && tab !== "shop") playShopEnter(); onSelect(); }}>
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
              {replay && <button className={`nb${tab === "battle" ? " active" : ""}`} onClick={openBattleReport}>{replay.won ? "🏆" : "⚔"} {L("報告", "Report", "报告")}</button>}
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
                  dungeonInjuredUntil={recovery.dungeonInjuredUntil}
                />
              )}

              {tab === "train" && (
                <TrainTab
                  trainingCards={trainingCards}
                  enhanceLog={enhanceLog}
                  enhanceItems={enhanceItems}
                  enhanceAnim={enhanceAnim}
                  synthesisCards={synthesisCards}
                  synthesisGoldCost={synthesisGoldCost}
                  synthesisLog={synthesisLog}
                  synthesisResult={synthesisResult}
                  synthesisUids={synthesisUids}
                  doSynthesize={doSynthesize}
                  toggleSynthesisUid={toggleSynthesisUid}
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
                  onSellJunk={() => sellJunk(sellThreshold)}
                  sellThreshold={sellThreshold}
                  onSellThresholdChange={setSellThreshold}
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

        <ClassSelectModal
          open={classModalOpen}
          onChoose={chooseClass}
          onCancel={closeClassModal}
          currentClass={player.jobClass}
          playerLevel={player.level}
          monsterKills={player.monsterKills}
        />

        {modifierPending && (
          <DungeonModifierModal
            modifier={modifierPending.modifier}
            dungeonName={tr(modifierPending.dungeon, "name")}
            tierLabel={tr(modifierPending.tier, "label")}
            onConfirm={confirmModifier}
            onCancel={cancelModifier}
          />
        )}
      </div>

      <TutorialOverlay
        step={tutorialStep}
        activeTab={tab}
        onAdvance={advanceTutorial}
        onSkip={skipTutorial}
      />
    </>
  );
}
