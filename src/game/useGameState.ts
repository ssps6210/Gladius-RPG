import { useCallback, useEffect, useRef, useState } from "react";

import {
  INITIAL_EQUIPMENT,
  INITIAL_PLAYER,
} from "./constants";
import { ENHANCE_LEVELS } from "./data/enhanceLevels";
import { DUNGEON_TIERS } from "./data/dungeonTiers";
import { DUNGEONS } from "./data/dungeons";
import { EQUIP_SLOTS } from "./data/equipmentSlots";
import { SLOT_CLASS_UNLOCK, SLOT_BASE_TYPE } from "./types/shared";
import { playLootDrop, playLevelUp, playVictory, playDefeat, playEnhance, playGold } from "./audio";
import { EXPEDITIONS } from "./data/expeditions";
import { MERC_DUNGEONS } from "./data/mercenaries";
import { MONSTERS } from "./data/monsters";
import { JOB_CLASSES } from "./data/classes";
import { QUEST_DEFS } from "./data/quests";
import { TRAIN_STATS } from "./data/trainStats";
import { WEAPON_CATEGORIES } from "./data/weaponCategories";
import { TRAIN_STAT_DISPLAY_KEYS } from "./lib/display";
import { applyEnhanceBonus, calcSellPrice, enhanceCost } from "./lib/items";
import { trainCost } from "./lib/training";
import { clearGameState, loadGameState, saveGameState } from "./persistence";
import { getBulkSellResult } from "./systems/economy";
import { RARITIES } from "./data/rarities";
import {
  applyProgressionRewards,
  cAtk,
  cDef,
  cMhp,
  cSpd,
  checkQuestReset,
  genArenaOpponent,
  genAuctionItem,
  genLoot,
  genMercScroll,
  genShopItem,
  gSpec,
  getRarity,
  getSetEffects,
  getWeaponCat,
  initQuestState,
  isQuestDone,
  setCombatLang,
  simulateArenaBattle,
  simulateExpedition,
  simulateMercRun,
  simulateRun,
} from "./systems";
import { useLanguage } from "./i18n/LanguageContext";
import {
  abandonTavernQuest,
  acceptTavernQuest,
  claimTavernQuestReward,
  createInitialTavernQuestState,
  dismissStoryReward,
  refreshTavernBoard,
} from "./systems/tavernQuests";
import type {
  AnyRecord,
  GameArenaOpponent,
  GameItem,
  GamePlayer,
  GameQuestState,
  GameReplay,
  LootDrop,
} from "./appTypes";

type SellThreshold = "normal" | "magic" | "rare" | "legendary" | "mythic";

export function useGameState(slot: import("./constants/storage").SaveSlot = 1) {
  const { lang, t, L, tr } = useLanguage();
  useEffect(() => {
    setCombatLang(lang);
  }, [lang]);

  const initialSave = loadGameState(slot);
  const [player, setPlayer] = useState<GamePlayer>(() => initialSave.player as GamePlayer);

  const [inventory, setInventory] = useState<GameItem[]>(() => initialSave.inventory as GameItem[]);

  const [tab, setTab] = useState("dungeon");
  const [replay, setReplay] = useState<GameReplay | null>(null);
  const replayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lootDrop, setLootDrop] = useState<LootDrop | null>(null);
  const [selectedScrolls, setSelectedScrolls] = useState<any[]>([]);
  const [saveMsg, setSaveMsg] = useState("");
  const [shopFilter, setShopFilter] = useState("all");
  const [invFilter, setInvFilter] = useState("all");
  const [sellThreshold, setSellThreshold] = useState<SellThreshold>("normal");
  const [synthesisUids, setSynthesisUids] = useState<any[]>([]);
  const [synthesisResult, setSynthesisResult] = useState<any>(null);
  const [synthesisLog, setSynthesisLog] = useState<string[]>([]);
  const [shopItems, setShopItems] = useState<any[]>(() =>
    Array.from({ length: 8 }, (_, i) =>
      genShopItem(1, ["weapon", "offhand", "armor", "helmet", "gloves", "boots", "ring", "amulet"][i]),
    ),
  );
  const [auctionItems, setAuctionItems] = useState<any[]>(() => Array.from({ length: 4 }, () => genAuctionItem(1)));
  const [shopTab, setShopTab] = useState("buy");
  const [bidInput, setBidInput] = useState<AnyRecord>({});
  const [enhanceTarget, setEnhanceTarget] = useState<any>(null);
  const [enhanceLog, setEnhanceLog] = useState<string[]>([]);
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [enhanceAnim, setEnhanceAnim] = useState<string | null>(null);
  const [arenaOpponents, setArenaOpponents] = useState<GameArenaOpponent[]>([]);
  const [dungeonInjuredUntil, setDungeonInjuredUntil] = useState(0);
  const [arenaInjuredUntil, setArenaInjuredUntil] = useState(0);
  const [arenaRefreshes, setArenaRefreshes] = useState(5);
  const [arenaLastDate, setArenaLastDate] = useState("");
  const [questState, setQuestState] = useState<GameQuestState>(() => initQuestState());
  const [questNotify, setQuestNotify] = useState<string | null>(null);
  const [tavernQuestState, setTavernQuestState] = useState(() => ({
    ...createInitialTavernQuestState((initialSave.player as GamePlayer).level || 1),
    progress: { ...(((initialSave.player as GamePlayer).monsterKills as Record<string, number>) || {}) },
  }));

  const save = useCallback(() => {
    saveGameState({ player, inventory }, slot);
    setSaveMsg(t("savedMsg"));
    setTimeout(() => setSaveMsg(""), 2000);
  }, [inventory, player, slot]);

  const reset = () => {
    if (!confirm(t("confirmReset"))) return;
    clearGameState(slot);
    setPlayer({ ...INITIAL_PLAYER, equipment: { ...INITIAL_EQUIPMENT } });
    setInventory([]);
    setDungeonInjuredUntil(0);
    setArenaInjuredUntil(0);
    setTavernQuestState(createInitialTavernQuestState(1));
    setReplay(null);
    setSelectedScrolls([]);
  };

  const tAtk = cAtk(player);
  const tDef = cDef(player);
  const tMhp = cMhp(player);
  const tSpd = cSpd(player);
  const pSpec = gSpec(player);
  const wCat = getWeaponCat(player);
  const renderedQuestState = checkQuestReset(questState, player);
  const questBadgeCount = Object.keys(QUEST_DEFS).filter((qid) => isQuestDone(qid, { ...player, _inv: inventory }, renderedQuestState)).length;
  const equipmentSidebarItems = EQUIP_SLOTS.filter((slot) => {
    const unlock = SLOT_CLASS_UNLOCK[slot.id as keyof typeof SLOT_CLASS_UNLOCK];
    return !unlock || player.jobClass === unlock;
  }).map((slot) => {
    const equippedItem = player.equipment[slot.id];
    const rarity = equippedItem ? getRarity(equippedItem.rarity) : null;
    const rarityColor = rarity ? rarity.color : "#2a1808";
    const glow = (rarity && rarity.glow) || "";
    const category = equippedItem && equippedItem.cat ? WEAPON_CATEGORIES[equippedItem.cat] : null;
    const effectiveness = slot.effectiveness;

    return {
      category,
      equippedItem,
      effectiveness,
      onUnequip: () => unequip(slot.id),
      rarityColor,
      slot,
      style: {
        display: "flex",
        alignItems: "flex-start" as const,
        gap: 6,
        padding: "5px 7px",
        marginBottom: 4,
        background: equippedItem ? `${rarityColor}0d` : "rgba(0,0,0,0.2)",
        border: `1px solid ${equippedItem ? `${rarityColor}66` : "#1e1208"}`,
        borderRadius: 3,
        cursor: equippedItem ? "pointer" : "default",
        boxShadow: equippedItem && glow ? glow : "none",
        transition: "all .2s",
      },
      textShadow: glow ? `0 0 6px ${rarityColor}88` : "none",
      title: equippedItem ? L("點擊卸下", "Click to unequip") : `${tr(slot, "label")}${L("（空）", " (empty)")}`,
    };
  });
  const navTabs = [
    { id: "dungeon", label: t("tabDungeon"), badgeCount: 0 },
    { id: "arena", label: t("tabArena"), badgeCount: 0 },
    { id: "tavern", label: t("tabTavern"), badgeCount: 0 },
    { id: "quest", label: t("tabQuest"), badgeCount: questBadgeCount },
    { id: "shop", label: t("tabShop"), badgeCount: 0 },
    { id: "inventory", label: t("tabInventory"), badgeCount: 0 },
    { id: "train", label: t("tabForge"), badgeCount: 0 },
  ].map((tabItem) => ({
    ...tabItem,
    onSelect: () => handleTabSelect(tabItem.id),
  }));
  const expeditionCards = EXPEDITIONS.map((expedition) => {
    const monster = MONSTERS[expedition.monster];
    const locked = player.level < expedition.minLv;

    return {
      expedition,
      icon: (monster && monster.icon) || expedition.icon,
      isLocked: locked,
      monsterName: monster && tr(monster, "name"),
      onStart: locked ? undefined : () => startExpedition(expedition),
      style: { borderColor: locked ? "#2a1808" : "#3a2a10" },
      traitDesc: monster && tr(monster, "traitDesc"),
    };
  });
  const dungeonSections = DUNGEONS.map((dungeon) => ({
    bossIcon: MONSTERS[dungeon.boss] ? MONSTERS[dungeon.boss].icon : "👑",
    bossName: MONSTERS[dungeon.boss] ? tr(MONSTERS[dungeon.boss], "name") : "Boss",
    icon: dungeon.icon,
    id: dungeon.id,
    lore: tr(dungeon, "lore"),
    minLv: dungeon.minLv,
    name: tr(dungeon, "name"),
    tierCards: DUNGEON_TIERS.map((tier) => {
      const req = dungeon.minLv + tier.minLvOffset;
      const locked = player.level < req;

      return {
        dungeon,
        isLocked: locked,
        onStart: locked ? undefined : () => startBattle(dungeon, tier),
        req,
        tier,
      };
    }),
    waveBadges: dungeon.waves.map((wave: any, wi: number) => ({
      enemies: wave.monsters.map((key: any) => (MONSTERS[key] ? MONSTERS[key].icon : "?")).join(""),
      key: wave.label,
      label: L(wave.label.split(" — ")[1]?.trim() ?? `第${wi + 1}波`, `W${wi + 1}`),
    })),
  }));

  function lvUp(np: any, expG: any, goldG: any, log: any) {
    // Apply set bonus: bonus experience
    const expBonus = getSetEffects(np).expBonus;
    const boostedExp = expBonus > 0 ? Math.floor(expG * (1 + expBonus / 100)) : expG;
    const withGold = { ...np, gold: (np.gold || 0) + goldG };
    const prevLevel = withGold.level;
    const { player: next } = applyProgressionRewards(withGold, { exp: boostedExp, gold: 0 });
    for (let lv = prevLevel + 1; lv <= next.level; lv++) {
      log.push({ txt: L(`🌟 等級提升！Lv.${lv}！`, `🌟 Level Up! Lv.${lv}!`), type: "win" });
    }
    if (next.level > prevLevel) {
      // Restore to full computed max HP (including equipment + training bonuses)
      next.hp = cMhp(next);
      playLevelUp();
    }
    return next;
  }

  function mergeMonsterKills(current: Record<string, number>, kills: Array<{ enemyId: string; count: number }>) {
    const merged = { ...current };
    for (const kill of kills) {
      merged[kill.enemyId] = (merged[kill.enemyId] || 0) + kill.count;
    }
    return merged;
  }

  const updateQuestProgress = (updatedPlayer: any, updatedInventory: any) => {
    const statsWithInv = { ...updatedPlayer, _inv: updatedInventory || inventory };
    const newQs = checkQuestReset(questState, updatedPlayer);
    Object.keys(QUEST_DEFS).forEach((id) => {
      if (!(newQs.progress[id] && newQs.progress[id].collected)) {
        if (isQuestDone(id, statsWithInv, newQs)) {
          // Only notify once per quest
        }
      }
    });
    if (newQs !== questState) setQuestState(newQs);
  };

  const startBattle = (dungeon: any, tier: any) => {
    const now = Date.now();
    if (now < dungeonInjuredUntil) {
      const mins = Math.ceil((dungeonInjuredUntil - now) / 60_000);
      alert(L(`你仍在養傷中，還需 ${mins} 分鐘才能出戰！`, `Still recovering — ${mins} more minutes before you can fight!`));
      setTab("tavern");
      return;
    }

    const result = simulateRun(dungeon, tier, { ...player }, { lvUp, genLoot, genMercScroll });
    const fp = result.finalPlayer;
    const mergedKills = mergeMonsterKills((fp.monsterKills as Record<string, number>) || {}, result.kills || []);
    const killCount = dungeon.waves.flatMap((w: any) => w.monsters).length + (dungeon.boss ? 1 : 0);
    const bossKill = result.won ? 1 : 0;
    fp.totalKills = (fp.totalKills || 0) + (result.won ? killCount : Math.floor(killCount * 0.5));
    fp.totalBossKills = (fp.totalBossKills || 0) + bossKill;
    fp.totalDungeons = (fp.totalDungeons || 0) + (result.won ? 1 : 0);
    fp.totalGoldEarned = (fp.totalGoldEarned || 0) + Math.max(0, fp.gold - player.gold);
    fp.highestLevel = Math.max(fp.highestLevel || 1, fp.level);
    fp.monsterKills = mergedKills;
    if (!result.won) {
      setDungeonInjuredUntil(now + 30 * 60 * 1000);
    }
    setPlayer(fp);
    setTavernQuestState((state) => ({ ...state, progress: mergedKills }));
    setReplay({
      lines: result.log,
      cursor: 0,
      drops: result.drops as GameItem[],
      dungeon,
      tier,
      won: result.won,
      pending: false,
      isExpedition: false,
    } as GameReplay);
    setTab("battle");
    updateQuestProgress(fp, inventory);
  };

  const startExpedition = (expedition: any) => {
    const now = Date.now();
    if (now < dungeonInjuredUntil) {
      const mins = Math.ceil((dungeonInjuredUntil - now) / 60_000);
      alert(L(`你仍在養傷中，還需 ${mins} 分鐘才能出戰！`, `Still recovering — ${mins} more minutes before you can fight!`));
      setTab("tavern");
      return;
    }

    const result = simulateExpedition(expedition, { ...player }, { lvUp, genLoot, genMercScroll });
    const fp = result.finalPlayer;
    const mergedKills = mergeMonsterKills((fp.monsterKills as Record<string, number>) || {}, result.kills || []);
    fp.totalKills = (fp.totalKills || 0) + (result.won ? 1 : 0);
    fp.totalExpeditions = (fp.totalExpeditions || 0) + (result.won ? 1 : 0);
    fp.totalGoldEarned = (fp.totalGoldEarned || 0) + Math.max(0, fp.gold - player.gold);
    fp.highestLevel = Math.max(fp.highestLevel || 1, fp.level);
    fp.monsterKills = mergedKills;
    if (!result.won) {
      setDungeonInjuredUntil(now + 30 * 60 * 1000);
    }
    setPlayer(fp);
    setTavernQuestState((state) => ({ ...state, progress: mergedKills }));
    setReplay({
      lines: result.log,
      cursor: 0,
      drops: result.drops as GameItem[],
      won: result.won,
      expedition,
      isExpedition: true,
    } as GameReplay);
    setTab("battle");
    updateQuestProgress(fp, inventory);
  };

  function handleTabSelect(nextTab: string) {
    setTab(nextTab);
    if (nextTab === "arena" && arenaOpponents.length === 0) initArena();
    if (nextTab === "tavern" && tavernQuestState.board.length === 0) {
      setTavernQuestState((state) => refreshTavernBoard(state, player.level));
    }
  }

  useEffect(() => {
    if (dungeonInjuredUntil > 0 && player.hp >= cMhp(player)) {
      setDungeonInjuredUntil(0);
    }
  }, [dungeonInjuredUntil, player]);

  // Auto-open class selection at Lv30 (first class) and Lv70 (second class)
  useEffect(() => {
    const cls = player.jobClass ? (JOB_CLASSES as any)[player.jobClass] : null;
    const isOnTier1 = cls && cls.tier === 1;
    if (player.level >= 30 && !player.jobClass) {
      setClassModalOpen(true);
    } else if (player.level >= 70 && isOnTier1) {
      setClassModalOpen(true);
    }
  }, [player.level, player.jobClass]);

  useEffect(() => {
    if (!replay || replay.cursor >= replay.lines.length) return;
    const delay = replay.lines[replay.cursor] && replay.lines[replay.cursor].type === "sep"
      ? 60
      : replay.lines[replay.cursor] && replay.lines[replay.cursor].type === "title"
        ? 100
        : 30;
    replayTimerRef.current = setTimeout(() => {
      setReplay((r) => (r ? { ...r, cursor: r.cursor + 1 } : null));
    }, delay);
    return () => {
      if (replayTimerRef.current) clearTimeout(replayTimerRef.current);
    };
  }, [replay]);

  useEffect(() => {
    if (!replay || replay.cursor < replay.lines.length) return;
    if (replay.drops && replay.drops.length > 0 && !lootDrop) {
      setLootDrop({ ...replay.drops[0], _remaining: replay.drops.slice(1) } as LootDrop);
      playLootDrop();
    } else if (!lootDrop) {
      if (replay.won) playVictory(); else playDefeat();
    }
  }, [replay && replay.cursor]);

  const takeLoot = () => {
    const remaining = (lootDrop && lootDrop._remaining) || [];
    if (!lootDrop) return;
    setInventory((inv) => [...inv, { ...lootDrop, _remaining: undefined }]);
    if (remaining.length > 0) {
      setLootDrop({ ...remaining[0], _remaining: remaining.slice(1) } as LootDrop);
      playLootDrop();
    } else {
      setLootDrop(null);
    }
  };

  const discardLoot = () => {
    const remaining = (lootDrop && lootDrop._remaining) || [];
    setLootDrop(remaining.length > 0 ? ({ ...remaining[0], _remaining: remaining.slice(1) } as LootDrop) : null);
  };

  const equipLootNow = () => {
    if (!lootDrop) return;
    const item = { ...lootDrop, _remaining: undefined };
    const remaining = (lootDrop && lootDrop._remaining) || [];
    const old = player.equipment[item.slot];
    setPlayer((p) => ({ ...p, equipment: { ...p.equipment, [item.slot]: item } }));
    if (old) setInventory((inv) => [...inv, { ...old, uid: Date.now() }]);
    setLootDrop(remaining.length > 0 ? ({ ...remaining[0], _remaining: remaining.slice(1) } as LootDrop) : null);
  };

  const mercScrollsInInv = inventory.filter((i) => i.type === "merc_scroll");
  const selectedScrollObjs = selectedScrolls.map((uid) => inventory.find((i) => i.uid === uid)).filter(Boolean);
  const mercSelectionCards = mercScrollsInInv.map((scroll) => {
    const rarity = getRarity(scroll.rarity);
    const selected = selectedScrolls.includes(scroll.uid);

    return {
      rarity,
      scroll,
      selected,
      onToggle: () => toggleSelectedScroll(scroll.uid),
      style: {
        background: `linear-gradient(160deg,${rarity.color}12,#0e0a06)`,
        border: `1px solid ${selected ? rarity.color : `${rarity.color}44`}`,
        boxShadow: selected && rarity.glow ? rarity.glow : "none",
        borderRadius: 5,
        padding: "10px",
        textAlign: "center" as const,
        cursor: "pointer",
        transition: "all .2s",
      },
      statusText: selected ? L("✓ 已選", "✓ Selected") : tr(scroll, "desc"),
      statusTextColor: selected ? rarity.color : "#4a3020",
    };
  });
  const mercDungeonCards = MERC_DUNGEONS.map((dungeon, index) => {
    const locked = player.level < dungeon.minLv;
    const tierColors = ["#8a9070", "#4caf50", "#4a9fd4", "#9c50d4", "#e07020"];
    const tierColor = tierColors[index] || "#8a9070";

    return {
      dungeon,
      enemyGroups: dungeon.waves.map((wave: any, waveIndex: number) => ({
        enemies: wave.enemies.map((key: any) => (MONSTERS[key] ? MONSTERS[key].icon : "👹")).join(""),
        key: waveIndex,
      })),
      isLocked: locked,
      onStart: locked ? undefined : () => startMercBattle(dungeon.id),
      style: {
        borderColor: locked ? "#2a1808" : `${tierColor}66`,
        background: locked ? "linear-gradient(135deg,#1a1208,#141008)" : `linear-gradient(135deg,${tierColor}0a,#141008)`,
      },
      tierColor,
    };
  });

  const startMercBattle = (dungeonId: any) => {
    const now = Date.now();
    if (now < dungeonInjuredUntil) {
      const mins = Math.ceil((dungeonInjuredUntil - now) / 60_000);
      alert(L(`你仍在養傷中，還需 ${mins} 分鐘才能出戰！`, `Still recovering — ${mins} more minutes before you can fight!`));
      setTab("tavern");
      return;
    }

    const dungeon = MERC_DUNGEONS.find((d) => d.id === dungeonId) || MERC_DUNGEONS[0];
    if (player.level < dungeon.minLv) {
      alert(L(`需要 Lv.${dungeon.minLv}！`, `Requires Lv.${dungeon.minLv}!`));
      return;
    }
    if (!selectedScrolls.length) {
      alert(L("請先從背包選擇傭兵契約捲軸！", "Select merc scrolls from your inventory first!"));
      return;
    }
    const usedUids = new Set(selectedScrolls);
    setInventory((inv) => inv.filter((i) => !usedUids.has(i.uid)));
    const mercs = selectedScrollObjs.map((s: any) => ({ ...s, curHp: s.hp, alive: true }));
    const np = { ...player };
    const result = simulateMercRun(dungeonId, np, mercs, { lvUp, genLoot, genMercScroll, mercDungeons: MERC_DUNGEONS });
    const fp = result.finalPlayer;
    const mergedKills = mergeMonsterKills((fp.monsterKills as Record<string, number>) || {}, result.kills || []);
    fp.totalMercRuns = (fp.totalMercRuns || 0) + (result.won ? 1 : 0);
    fp.highestLevel = Math.max(fp.highestLevel || 1, fp.level);
    fp.monsterKills = mergedKills;
    if (!result.won) {
      setDungeonInjuredUntil(now + 30 * 60 * 1000);
    }
    setPlayer(fp);
    setTavernQuestState((state) => ({ ...state, progress: mergedKills }));
    setSelectedScrolls([]);
    setReplay({
      lines: result.log,
      cursor: 0,
      drops: result.drops as GameItem[],
      won: result.won,
      isMerc: true,
      mercDungeonId: dungeonId,
    } as GameReplay);
    setTab("battle");
    updateQuestProgress(fp, inventory);
  };

  const addFreeMercScroll = () => {
    const s = genMercScroll(player.level);
    setInventory((inv) => [...inv, s]);
  };

  function toggleSelectedScroll(uid: any) {
    setSelectedScrolls((prev) => (prev.includes(uid) ? prev.filter((x) => x !== uid) : [...prev, uid]));
  }

  const selectMercScrollFromInventory = (uid: any) => {
    toggleSelectedScroll(uid);
    setTab("dungeon");
  };

  const usePotion = () => {
    const idx = inventory.findIndex((i) => i.type === "potion");
    if (idx === -1) return;
    const p = inventory[idx];
    const ni = [...inventory];
    ni.splice(idx, 1);
    setPlayer((pl) => ({ ...pl, hp: Math.min(pl.hp + (p.heal || 0), cMhp(pl)) }));
    setInventory(ni);
  };

  const useInventoryPotion = (uid: any) => {
    const item = inventory.find((i) => i.uid === uid);
    if (!item) return;
    setPlayer((p) => ({ ...p, hp: Math.min(p.hp + item.heal, cMhp(p)) }));
    setInventory((inv) => inv.filter((i) => i.uid !== uid));
  };

  const buyItem = (item: any) => {
    if (player.gold < item.cost) return;
    setPlayer((p) => ({ ...p, gold: p.gold - item.cost }));
    const { cost: _c, auctionId: _a, currentBid: _b, myBid: _m, bidCount: _bc, endsIn: _e, sold: _s, ...clean } = item;
    setInventory((inv) => [...inv, { ...clean, uid: Date.now() + Math.random(), specials: clean.specials || [], affixes: clean.affixes || [] }]);
  };

  const handleBuyPotion = (item: any) => {
    buyItem({ ...item, type: "potion", uid: Date.now() + Math.random(), specials: [], affixes: [] });
  };

  const sellItem = (uid: any) => {
    const item = inventory.find((i) => i.uid === uid);
    if (!item) return;
    const price = calcSellPrice(item);
    setPlayer((p) => ({ ...p, gold: p.gold + price }));
    setInventory((inv) => inv.filter((i) => i.uid !== uid));
    playGold();
  };

  const sortInventory = () => {
    const order = ["weapon", "offhand", "armor", "helmet", "gloves", "boots", "ring", "amulet", "merc_scroll", "potion"];
    const rarOrder = ["mythic", "legendary", "rare", "magic", "normal"];
    setInventory((inv) =>
      [...inv].sort((a, b) => {
        const si = order.indexOf(a.type || a.slot) - order.indexOf(b.type || b.slot);
        if (si !== 0) return si;
        return rarOrder.indexOf(a.rarity) - rarOrder.indexOf(b.rarity);
      }),
    );
  };

  const sellJunk = (threshold: SellThreshold = sellThreshold) => {
    const result = getBulkSellResult(inventory, player.equipment as Record<string, any>, threshold);
    if (!result.items.length) {
      alert(L(`沒有${getRarity(threshold).label}以下的裝備可賣`, `No gear at or below ${tr(getRarity(threshold), "label")} to sell`));
      return;
    }

    const soldUids = new Set(result.items.map((item) => item.uid));
    setPlayer((p) => ({ ...p, gold: p.gold + result.gold }));
    setInventory((inv) => inv.filter((item) => !soldUids.has(item.uid)));
    alert(L(`賣出 ${result.items.length} 件裝備，獲得 ${result.gold} 金幣`, `Sold ${result.items.length} items for ${result.gold} gold`));
  };

  const refreshShop = () => {
    const cost = Math.floor(player.level * 5 + 20);
    if (player.gold < cost) {
      alert(L(`刷新需要 ${cost} 金幣`, `Refresh costs ${cost} gold`));
      return;
    }
    setPlayer((p) => ({ ...p, gold: p.gold - cost }));
    setShopItems(Array.from({ length: 8 }, () => genShopItem(player.level)));
  };
  const refreshShopCost = Math.floor(player.level * 5 + 20);
  const tavernRestCost = Math.max(50, Math.floor(player.level * 15));

  const restAtInn = () => {
    const now = Date.now();
    const atFullHp = player.hp >= cMhp(player);
    const needsRest = now < dungeonInjuredUntil || now < arenaInjuredUntil || !atFullHp;

    if (!needsRest) {
      alert(L("你目前狀態良好，暫時不需要住宿。", "You're in good shape — no need to rest."));
      return;
    }
    if (player.gold < tavernRestCost) {
      alert(L(`住宿需要 ${tavernRestCost} 金幣。`, `Resting costs ${tavernRestCost} gold.`));
      return;
    }

    setPlayer((p) => ({ ...p, gold: p.gold - tavernRestCost, hp: cMhp(p) }));
    setDungeonInjuredUntil(0);
    setArenaInjuredUntil(0);
  };

  const refreshTavern = () => {
    const cost = Math.max(20, Math.floor(player.level * 8));
    if (player.gold < cost) {
      alert(L(`刷新酒館告示板需要 ${cost} 金幣`, `Refreshing the tavern board costs ${cost} gold`));
      return;
    }

    setPlayer((p) => ({ ...p, gold: p.gold - cost }));
    setTavernQuestState((state) => refreshTavernBoard(state, player.level));
  };

  const acceptTavernQuestAction = (questId: string) => {
    setTavernQuestState((state) => acceptTavernQuest(state, questId));
  };

  const abandonTavernQuestAction = (questId: string) => {
    setTavernQuestState((state) => abandonTavernQuest(state, questId));
  };

  const claimTavernQuestAction = (questId: string) => {
    const quest = tavernQuestState.board.find((entry) => entry.id === questId);
    const acceptedState = tavernQuestState.accepted[questId];
    if (!quest || !acceptedState?.accepted) return;

    const currentKills = tavernQuestState.progress[quest.targetMonster] ?? 0;
    if (currentKills - acceptedState.baseKills < quest.reqCount) return;

    setPlayer((p) => {
      const log: any[] = [];
      return lvUp({ ...p }, quest.reward.exp, quest.reward.gold, log);
    });
    setTavernQuestState((state) => claimTavernQuestReward({ ...state, activeQuestId: questId }));
    setQuestNotify(L(`✅ 酒館委託完成：${quest.title}`, `✅ Tavern bounty complete: ${tr(quest, "title")}`));
    setTimeout(() => setQuestNotify(null), 3000);
  };

  const dismissTavernStory = () => {
    setTavernQuestState((state) => dismissStoryReward(state));
  };

  const doEnhance = (uid: any) => {
    const fromInv = inventory.find((i) => i.uid === uid);
    const equippedSlot = Object.entries(player.equipment).find(([, eq]) => eq && eq.uid === uid);
    const item = fromInv || (equippedSlot && equippedSlot[1]);
    const isEquippedItem = !fromInv && !!equippedSlot;

    if (!item) return;
    const curLv = item.enhLv || 0;
    if (curLv >= 10) {
      setEnhanceLog((l) => [L(`⚠️ 已達最高強化等級 +10`, `⚠️ Max enhancement +10 reached`), ...l]);
      return;
    }
    const lvData = ENHANCE_LEVELS[curLv];
    const cost = enhanceCost(item);
    if (player.gold < cost) {
      setEnhanceLog((l) => [L(`💰 金幣不足（需要 ${cost}）`, `💰 Not enough gold (need ${cost})`), ...l]);
      return;
    }

    setPlayer((p) => ({ ...p, gold: p.gold - cost }));

    const success = Math.random() < lvData.rate;
    if (success) {
      const newLv = curLv + 1;
      const baseAttack = item.baseAttack || (item.attack || 0);
      const baseDefense = item.baseDefense || (item.defense || 0);
      const baseHp = item.baseHp || (item.hp || 0);
      const baseSpeed = item.baseSpeed || (item.speed || 0);
      const enhanced = {
        ...item,
        enhLv: newLv,
        baseAttack,
        baseDefense,
        baseHp,
        baseSpeed,
        ...applyEnhanceBonus({ ...item, enhLv: newLv, baseAttack, baseDefense, baseHp, baseSpeed }),
      };
      if (isEquippedItem) {
        const slot = equippedSlot[0];
        setPlayer((p) => ({ ...p, equipment: { ...p.equipment, [slot]: enhanced } }));
      } else {
        setInventory((inv) => inv.map((i) => (i.uid === uid ? enhanced : i)));
        Object.entries(player.equipment).forEach(([slot, eq]) => {
          if (eq && eq.uid === uid) setPlayer((p) => ({ ...p, equipment: { ...p.equipment, [slot]: enhanced } }));
        });
      }
      setEnhanceAnim("success");
      playEnhance(true);
      setEnhanceLog((l) => [L(`✨ 強化成功！${item.name} → +${newLv}！費用 ${cost} 金幣`, `✨ Enhance success! ${tr(item, "name")} → +${newLv}! Cost ${cost} gold`), ...l]);
      setPlayer((p) => {
        const np2 = { ...p, totalEnhances: (p.totalEnhances || 0) + 1 };
        updateQuestProgress(np2, inventory);
        return np2;
      });
    } else {
      const newLv = curLv <= 3 ? curLv : curLv - 1;
      const degraded = newLv === curLv
        ? item
        : applyEnhanceBonus({
            ...item,
            enhLv: newLv,
            baseAttack: item.baseAttack || (item.attack || 0),
            baseDefense: item.baseDefense || (item.defense || 0),
            baseHp: item.baseHp || (item.hp || 0),
            baseSpeed: item.baseSpeed || (item.speed || 0),
          });
      if (newLv !== curLv) {
        if (isEquippedItem) {
          const slot = equippedSlot[0];
          setPlayer((p) => ({ ...p, equipment: { ...p.equipment, [slot]: { ...degraded, enhLv: newLv } } }));
        } else {
          setInventory((inv) => inv.map((i) => (i.uid === uid ? { ...degraded, enhLv: newLv } : i)));
          Object.entries(player.equipment).forEach(([slot, eq]) => {
            if (eq && eq.uid === uid) setPlayer((p) => ({ ...p, equipment: { ...p.equipment, [slot]: { ...degraded, enhLv: newLv } } }));
          });
        }
      }
      setEnhanceAnim("fail");
      playEnhance(false);
      setEnhanceLog((l) => [
        newLv < curLv
          ? L(`💔 強化失敗！+${curLv} → +${newLv}（降級）費用 ${cost} 金幣`, `💔 Enhance failed! +${curLv} → +${newLv} (downgrade) Cost ${cost} gold`)
          : L(`💔 強化失敗！+${curLv} 維持不變。費用 ${cost} 金幣`, `💔 Enhance failed! +${curLv} unchanged. Cost ${cost} gold`),
        ...l,
      ]);
    }
    setTimeout(() => setEnhanceAnim(null), 700);
  };

  const doTrain = (statId: any) => {
    const current = player[statId] || 0;
    const cost = trainCost(player.level, current);
    if (player.gold < cost) return;
    if (player.gold - cost < 50) {
      alert(L(`訓練費用 ${cost}，會讓金幣低於 50，請先賺更多金幣！`, `Training costs ${cost} and would drop gold below 50 — earn more first!`));
      return;
    }
    const trainStat = TRAIN_STATS.find((s) => s.id === statId);
    const isMhp = trainStat && trainStat.hpStat;
    setPlayer((p) => {
      const np = { ...p, gold: p.gold - cost, [statId]: (p[statId] || 0) + 1, totalTrains: (p.totalTrains || 0) + 1 };
      if (isMhp) np.hp = Math.min(np.hp + 3, cMhp(np));
      updateQuestProgress(np, inventory);
      return np;
    });
  };

  const RARITY_ORDER: Record<string, number> = { normal: 0, magic: 1, rare: 2, legendary: 3, mythic: 4 };
  const RARITY_SYNTHESIS_BONUS: Record<string, number> = { normal: 0, magic: 0.15, rare: 0.3, legendary: 0.5, mythic: 0.8 };
  const RARITY_NAMES: Record<string, string> = { normal: "普通", magic: "魔法", rare: "稀有", legendary: "傳說", mythic: "神話" };

  const synthesisItems = inventory.filter((i: any) => i.type !== "potion" && i.type !== "merc_scroll" && i.slot);

  const toggleSynthesisUid = (uid: any) => {
    setSynthesisUids((prev) => {
      if (prev.includes(uid)) return prev.filter((u) => u !== uid);
      if (prev.length >= 3) return prev;
      return [...prev, uid];
    });
    setSynthesisResult(null);
  };

  const doSynthesize = () => {
    if (synthesisUids.length < 2) {
      alert(L("至少需要 2 件裝備才能合成！", "You need at least 2 items to synthesize!"));
      return;
    }
    const items = synthesisUids.map((uid: any) => inventory.find((i: any) => i.uid === uid)).filter(Boolean);
    if (items.length < synthesisUids.length) {
      alert(L("部分裝備已不存在！", "Some selected items no longer exist!"));
      return;
    }
    const goldCost = synthesisUids.length * 30 * player.level;
    if (player.gold < goldCost) {
      alert(L(`合成需要 ${goldCost} 金幣！`, `Synthesis costs ${goldCost} gold!`));
      return;
    }

    // Determine output slot from most common slot
    const slotCounts: Record<string, number> = {};
    items.forEach((item: any) => { slotCounts[item.slot] = (slotCounts[item.slot] || 0) + 1; });
    const outputSlot = Object.entries(slotCounts).sort((a: any, b: any) => b[1] - a[1])[0][0];

    // Determine output rarity: highest rarity of inputs + 1 tier (with bonus chance based on count)
    const maxRarityIdx = Math.max(...items.map((item: any) => RARITY_ORDER[item.rarity || "normal"] || 0));
    const rarityBonus = items.reduce((sum: number, item: any) => sum + (RARITY_SYNTHESIS_BONUS[item.rarity || "normal"] || 0), 0);
    const bonusChance = synthesisUids.length === 3 ? 0.5 + rarityBonus : 0.2 + rarityBonus;
    let outputRarityIdx = maxRarityIdx;
    if (maxRarityIdx < 4 && Math.random() < bonusChance) {
      outputRarityIdx = maxRarityIdx + 1;
    }
    const outputRarity = RARITIES[outputRarityIdx] || RARITIES[0];

    // Generate a new item at the forced output rarity so affixes match the rarity.
    const upgraded = outputRarityIdx > maxRarityIdx;
    const result = genLoot(player.level, rarityBonus, outputSlot, outputRarity.id);
    const rarity = getRarity(outputRarity.id);

    // Scale stats higher for synthesis
    const synthScale = 1 + (synthesisUids.length - 1) * 0.15;
    const finalResult = {
      ...result,
      attack: Math.floor(result.attack * synthScale),
      defense: Math.floor(result.defense * synthScale),
      hp: Math.floor(result.hp * synthScale),
      speed: Math.floor(result.speed * synthScale),
      uid: Date.now() + Math.random(),
      // genLoot already named it per its rarity; just mark a rarity upgrade.
      name: upgraded ? "★" + result.name : result.name,
      nameEn: upgraded ? "★" + (result.nameEn || result.name) : (result.nameEn || result.name),
    };

    // Remove consumed items and gold
    const consumedUids = new Set(synthesisUids);
    setInventory((inv: any[]) => [...inv.filter((i: any) => !consumedUids.has(i.uid)), finalResult]);
    setPlayer((p: any) => ({ ...p, gold: p.gold - goldCost }));

    const msg = outputRarityIdx > maxRarityIdx
      ? L(`🎉 合成成功！稀有度提升至【${rarity.label}】！`, `🎉 Synthesis success! Rarity raised to [${tr(rarity, "label")}]!`)
      : L(`✅ 合成成功！獲得 ${rarity.label} ${finalResult.name}`, `✅ Synthesis success! Got ${tr(rarity, "label")} ${tr(finalResult, "name")}`);
    setSynthesisLog((l: string[]) => [msg, ...l.slice(0, 9)]);
    setSynthesisResult(finalResult);
    setSynthesisUids([]);
  };

  const synthesisCards = synthesisItems.map((item: any) => {
    const rar = getRarity(item.rarity);
    const selected = synthesisUids.includes(item.uid);

    return {
      item,
      rar,
      selected,
      onToggle: () => toggleSynthesisUid(item.uid),
    };
  });

  const synthesisGoldCost = synthesisUids.length * 30 * player.level;

  const initArena = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (arenaLastDate !== today) {
      setArenaLastDate(today);
      setArenaRefreshes(5);
    }
    setArenaOpponents(Array.from({ length: 4 }, () => genArenaOpponent(player.level)) as GameArenaOpponent[]);
  };

  const collectQuest = (questId: any) => {
    const def = QUEST_DEFS[questId];
    if (!def) return;
    const statsWithInv = { ...player, _inv: inventory };
    if (!isQuestDone(questId, statsWithInv, questState)) return;

    let np = { ...player };
    const drops: any[] = [];
    def.rewards.forEach((r: any) => {
      if (r.type === "gold") {
        np.gold += r.value;
      }
      if (r.type === "exp") {
        const log: any[] = [];
        np = lvUp(np, r.value, 0, log);
      }
      if (r.type === "item") {
        const d = genLoot(np.level, 0.8, null, r.rarity);
        drops.push(d);
      }
      if (r.type === "weapon") {
        const d = genLoot(np.level, 0.8, "weapon", r.rarity);
        drops.push(d);
      }
      if (r.type === "scroll") {
        const s = genMercScroll(np.level, r.rarity);
        drops.push(s);
      }
    });
    setPlayer(np);
    if (drops.length > 0) setInventory((inv) => [...inv, ...drops]);

    setQuestState((qs) => ({
      ...qs,
      progress: { ...qs.progress, [questId]: { ...(qs.progress[questId] || {}), collected: true } },
    }));

    const rewardText = def.rewards.map((r: any) => tr(r, "label")).join(L("、", ", "));
    setQuestNotify(L(`✅ 任務完成：${def.title}\n獎勵：${rewardText}`, `✅ Quest complete: ${tr(def, "title")}\nReward: ${rewardText}`));
    setTimeout(() => setQuestNotify(null), 3000);
  };

  const arenaRefresh = (free: any) => {
    if (free) {
      if (arenaRefreshes <= 0) return;
      setArenaRefreshes((r) => r - 1);
    } else {
      const cost = 50 + player.level * 10;
      if (player.gold < cost) {
        alert(L(`刷新需要 ${cost} 金幣！`, `Refresh costs ${cost} gold!`));
        return;
      }
      setPlayer((p) => ({ ...p, gold: p.gold - cost }));
    }
    setArenaOpponents(Array.from({ length: 4 }, () => genArenaOpponent(player.level)) as GameArenaOpponent[]);
  };

  const startArenaBattle = (opponent: any) => {
    const now = Date.now();
    if (now < arenaInjuredUntil) return;
    const result = simulateArenaBattle(player, opponent);
    const np = { ...result.finalPlayer };
    if (result.won) {
      np.gold = np.gold + result.goldPlundered;
      np.totalArenaWins = (np.totalArenaWins || 0) + 1;
      np.totalGoldEarned = (np.totalGoldEarned || 0) + result.goldPlundered;
      setArenaOpponents((ops) => ops.filter((o) => o.id !== opponent.id));
    } else {
      setArenaInjuredUntil(now + 30 * 60 * 1000);
      np.hp = Math.floor(cMhp(np) * 0.2);
      np.gold = Math.max(50, np.gold - Math.min(200, Math.floor(np.gold * 0.08)));
    }
    np.highestLevel = Math.max(np.highestLevel || 1, np.level);
    setPlayer(np);
    setReplay({ lines: result.log, cursor: 0, drops: [], won: result.won, isArena: true, opponent } as GameReplay);
    setTab("battle");
    updateQuestProgress(np, inventory);
  };

  const refreshAuction = () => {
    setAuctionItems(Array.from({ length: 4 }, () => genAuctionItem(player.level)));
  };

  const placeBid = (auctionId: any, amount: any) => {
    if (!amount || amount <= 0) return;
    setAuctionItems((items) =>
      items.map((it) => {
        if (it.auctionId !== auctionId) return it;
        const minBid = it.currentBid + Math.max(5, Math.floor(it.currentBid * 0.1));
        if (amount < minBid) {
          alert(L(`最低加價為 ${minBid} 金幣`, `Minimum bid is ${minBid} gold`));
          return it;
        }
        if (player.gold < amount) {
          alert(L("金幣不足！", "Not enough gold!"));
          return it;
        }
        setPlayer((p) => ({ ...p, gold: p.gold - amount + (it.myBid || 0) }));
        return { ...it, currentBid: amount, myBid: amount, bidCount: it.bidCount + 1 };
      }),
    );
  };

  const updateBidInputValue = (auctionId: any, value: string) => {
    setBidInput((b) => ({ ...b, [auctionId]: parseInt(value) || "" }));
  };

  const submitBid = (auctionId: any, amount: any) => {
    placeBid(auctionId, amount);
    setBidInput((b) => ({ ...b, [auctionId]: "" }));
  };

  const claimAuction = (auctionId: any) => {
    const it = auctionItems.find((a) => a.auctionId === auctionId);
    if (!it || !it.myBid) return;
    const { cost: _c, auctionId: _a, currentBid: _b, myBid: _m, bidCount: _bc, endsIn: _e, sold: _s, ...clean } = it;
    setInventory((inv) => [...inv, { ...clean, uid: Date.now() + Math.random() }]);
    setAuctionItems((items) => items.filter((a) => a.auctionId !== auctionId));
    refreshAuction();
  };

  const equipItem = (item: any) => {
    const old = player.equipment[item.slot];
    setPlayer((p) => ({ ...p, equipment: { ...p.equipment, [item.slot]: item } }));
    setInventory((inv) => {
      const n = inv.filter((i) => i.uid !== item.uid);
      if (old) n.push({ ...old, uid: Date.now() });
      return n;
    });
  };

  const equipToSlot = (item: any, targetSlot: string) => {
    const old = player.equipment[targetSlot];
    setPlayer((p) => ({ ...p, equipment: { ...p.equipment, [targetSlot]: item } }));
    setInventory((inv) => {
      const n = inv.filter((i) => i.uid !== item.uid);
      if (old) n.push({ ...old, uid: Date.now() });
      return n;
    });
  };

  const unequip = (slot: any) => {
    const item = player.equipment[slot];
    if (!item) return;
    setInventory((inv) => [...inv, { ...item, uid: Date.now() }]);
    setPlayer((p) => ({ ...p, equipment: { ...p.equipment, [slot]: null } }));
  };

  const chooseClass = (classId: string) => {
    if (classId) setPlayer((p) => ({ ...p, jobClass: classId }));
    setClassModalOpen(false);
  };

  const openClassModal = () => setClassModalOpen(true);
  const closeClassModal = () => setClassModalOpen(false);
  const goToTavern = () => setTab("tavern");

  const skipReplay = () => {
    setReplay((r) => (r ? { ...r, cursor: r.lines.length } : null));
  };

  const restartReplayBattle = () => {
    if (!replay) return;
    if (replay.isArena) {
      setTab("arena");
      return;
    }
    if (replay.isExpedition) {
      startExpedition(replay.expedition);
      return;
    }
    if (replay.isMerc) {
      startMercBattle(replay.mercDungeonId);
      return;
    }
    startBattle(replay.dungeon, replay.tier);
  };

  const closeReplay = () => {
    setReplay(null);
    setTab("dungeon");
  };

  const openBattleReport = () => {
    setTab("battle");
  };

  const replaySummary = replay
    ? {
        actionLabel: replay.isArena ? t("btnArenaBack") : t("btnRunAgain"),
        progressBackground: replay.won ? "linear-gradient(90deg,#1a5a1a,#40a040)" : "linear-gradient(90deg,#5a1a1a,#a04040)",
        progressWidth: `${Math.round((replay.cursor / replay.lines.length) * 100)}%`,
        showBattleSummary: replay.cursor >= replay.lines.length,
        statusText: replay.cursor < replay.lines.length ? t("battleWait") : t("battleEnd"),
        title: replay.isArena
          ? `🏟 ${L("競技場", "Arena")} · ${(replay.opponent && tr(replay.opponent, "name")) || L("對手", "Opponent")}`
          : replay.isExpedition
            ? `🗺 ${replay.expedition && tr(replay.expedition, "name")}`
            : replay.isMerc
              ? `🏴 ${(() => { const d = MERC_DUNGEONS.find((d) => d.id === replay.mercDungeonId); return d ? tr(d, "label") : L("傭兵副本", "Merc Dungeon"); })()}`
              : `${replay.dungeon ? `${replay.dungeon.icon} ${tr(replay.dungeon, "name")}` : "⚔"}${!replay.isExpedition && !replay.isMerc && !replay.isArena ? ` · ${replay.tier && tr(replay.tier, "label")}` : ""}`,
      }
    : null;

  const trainingCards = TRAIN_STATS.map((stat) => {
    const current = player[stat.id] || 0;
    const displayKey = TRAIN_STAT_DISPLAY_KEYS[stat.id];
    const cost = trainCost(player.level, current);
    const canAfford = player.gold - cost >= 50;
    const effect = stat.hpStat
      ? L(`每次+3最大HP（已訓${current}次，+${current * 3}HP）`, `+3 Max HP each (trained ${current}×, +${current * 3} HP)`)
      : L(`每次+1${stat.label}（已訓${current}次）`, `+1 ${tr(stat, "label")} each (trained ${current}×)`);

    return {
      canAfford,
      cost,
      current,
      desc: tr(stat, "desc"),
      displayValue: stat.hpStat ? `${player.maxHp + current * 3}` : `${(player[displayKey] || 0) + (current || 0)}`,
      effect,
      icon: stat.icon,
      id: stat.id,
      label: tr(stat, "label"),
      progressWidth: `${Math.min(100, current * 2)}%`,
      trainLabel: canAfford ? L(`訓練 (-🪙${cost})`, `Train (-🪙${cost})`) : L(`金幣不足（需 ${cost}，保留50）`, `Not enough (need ${cost}, keep 50)`),
      color: stat.color,
      onTrain: () => doTrain(stat.id),
    };
  });

  const enhanceItems = [
    ...Object.values(player.equipment).filter(Boolean),
    ...inventory.filter((i) => i.slot && i.slot !== "merc_scroll" && i.type !== "potion"),
  ].map((item) => {
    const rar = getRarity(item.rarity);
    const curLv = item.enhLv || 0;
    const isMax = curLv >= 10;
    const lvData = ENHANCE_LEVELS[curLv];
    const cost = enhanceCost(item);
    const canAfford = player.gold >= cost && !isMax;
    const isSelected = enhanceTarget === item.uid;
    const isEquipped = Object.values(player.equipment).some((e) => (e && e.uid) === item.uid);
    const enhColor = curLv >= 7 ? "#e07020" : curLv >= 4 ? "#9c50d4" : curLv >= 1 ? "#4caf50" : "#5a4020";

    return {
      canAfford,
      cost,
      curLv,
      enhColor,
      isEquipped,
      isMax,
      isSelected,
      item,
      lvData,
      rar,
      select: () => setEnhanceTarget(isSelected ? null : item.uid),
      triggerEnhance: (event: { stopPropagation: () => void }) => {
        event.stopPropagation();
        doEnhance(item.uid);
      },
    };
  });

  const potionShopItems = [
    { name: "小型回復藥", nameEn: "Minor Heal Potion", icon: "🧪", heal: 30, cost: 25 },
    { name: "大型回復藥", nameEn: "Major Heal Potion", icon: "⚗️", heal: 80, cost: 60 },
  ].map((item) => ({
    ...item,
    canAfford: player.gold >= item.cost,
    onBuy: () => handleBuyPotion(item),
  }));

  const auctionDisplayItems = auctionItems.filter((a) => !a.sold).map((it) => {
    const rar = getRarity(it.rarity);
    const cat = it.cat ? WEAPON_CATEGORIES[it.cat] : null;
    const myBid = bidInput[it.auctionId] || "";
    const minNext = it.currentBid + Math.max(5, Math.floor(it.currentBid * 0.1));
    const iWon = it.myBid > 0 && it.myBid === it.currentBid;

    return {
      cat,
      iWon,
      it,
      minNext,
      myBid,
      onBidInputChange: (event: { target: { value: string } }) => updateBidInputValue(it.auctionId, event.target.value),
      onClaim: () => claimAuction(it.auctionId),
      onSubmitBid: () => submitBid(it.auctionId, myBid),
      rar,
    };
  });
  const shopFilterOptions = ["all", "weapon", "offhand", "armor", "helmet", "gloves", "boots", "ring", "amulet"].map((filterId) => {
    const slotDef = EQUIP_SLOTS.find((slot) => slot.id === filterId);

    return {
      id: filterId,
      isActive: shopFilter === filterId,
      label: filterId === "all" ? t("filterAll") : slotDef ? tr(slotDef, "label") : filterId,
      onSelect: () => setShopFilter(filterId),
    };
  });
  const shopTabOptions = [["buy", t("shopBuy")], ["auction", t("shopAuction")], ["sell", t("shopSell")]].map(([id, label]) => ({
    id,
    isActive: shopTab === id,
    label,
    onSelect: () => setShopTab(id),
  }));
  const sellableInventory = inventory.filter((item) => item.type !== "potion");
  const hasSellableInventory = sellableInventory.length > 0;
  const sellListItems = sellableInventory.map((item) => {
    const rarity = getRarity(item.rarity);
    const price = calcSellPrice(item);

    return {
      item,
      onEquip: item.type === "merc_scroll" ? undefined : () => equipItem(item),
      onSell: () => sellItem(item.uid),
      price,
      rarity,
      selectLabel: selectedScrolls.includes(item.uid) ? t("scrollSelected") : t("addToParty"),
      onSelect: item.type === "merc_scroll" ? () => selectMercScrollFromInventory(item.uid) : undefined,
    };
  });
  const filteredShop = shopFilter === "all" ? shopItems : shopItems.filter((i) => i.slot === shopFilter || i.type === shopFilter);
  const filteredInv = invFilter === "all" ? inventory : inventory.filter((i) => i.slot === invFilter || i.type === invFilter);
  const potions = inventory.filter((i) => i.type === "potion").length;
  const expPct = Math.round((player.exp / player.expNeeded) * 100);
  const shopDisplayItems = filteredShop.map((item) => ({
    cat: item.cat ? WEAPON_CATEGORIES[item.cat] : null,
    item,
    onBuy: () => buyItem(item),
    rarity: getRarity(item.rarity),
  }));
  const inventoryItems = filteredInv.map((item) => {
    const rarity = getRarity(item.rarity);
    const price = calcSellPrice(item);
    const currentEquipped = item.slot && item.type !== "potion" && item.type !== "merc_scroll"
      ? (player.equipment[item.slot] as GameItem | null) ?? null
      : null;

    const secondarySlotId = Object.keys(SLOT_BASE_TYPE).find(
      (sid) => SLOT_BASE_TYPE[sid as keyof typeof SLOT_BASE_TYPE] === item.slot
        && SLOT_CLASS_UNLOCK[sid as keyof typeof SLOT_CLASS_UNLOCK] === player.jobClass
    ) as string | undefined;
    const currentEquipped2 = secondarySlotId
      ? (player.equipment[secondarySlotId] as GameItem | null) ?? null
      : null;

    return {
      item,
      currentEquipped,
      currentEquipped2,
      secondarySlotId,
      onEquip: item.type === "weapon" || item.slot ? () => equipItem(item) : undefined,
      onEquip2: secondarySlotId ? () => equipToSlot(item, secondarySlotId) : undefined,
      onSelectMerc: item.type === "merc_scroll" ? () => selectMercScrollFromInventory(item.uid) : undefined,
      onSell: () => sellItem(item.uid),
      onUse: item.type === "potion" ? () => useInventoryPotion(item.uid) : undefined,
      price,
      rarity,
      selectLabel: selectedScrolls.includes(item.uid) ? t("scrollSelected") : t("addToParty"),
    };
  });

  const SLOT_FILTERS = [
    { id: "all", label: t("filterAll") },
    { id: "weapon", label: t("slotWeapon") },
    { id: "offhand", label: t("slotOffhand") },
    { id: "armor", label: t("slotArmor") },
    { id: "helmet", label: t("slotHelmet") },
    { id: "gloves", label: t("slotGloves") },
    { id: "boots", label: t("slotBoots") },
    { id: "ring", label: t("slotRing") },
    { id: "amulet", label: t("slotAmulet") },
    { id: "potion", label: t("potionLabel") },
    { id: "merc_scroll", label: t("mercLabel") },
  ];
  const inventoryFilterOptions = SLOT_FILTERS.map((filter) => ({
    ...filter,
    isActive: invFilter === filter.id,
    onSelect: () => setInvFilter(filter.id),
  }));
  const recovery = { dungeonInjuredUntil, arenaInjuredUntil };

  return {
    acceptTavernQuestAction,
    abandonTavernQuestAction,
    arenaInjuredUntil,
    arenaOpponents,
    arenaRefresh,
    arenaRefreshes,
    auctionItems,
    auctionDisplayItems,
    bidInput,
    buyItem,
    claimAuction,
    collectQuest,
    discardLoot,
    doEnhance,
    doTrain,
    addFreeMercScroll,
    claimTavernQuestAction,
    dungeonSections,
    dungeonInjuredUntil,
    dismissTavernStory,
    equipmentSidebarItems,
    enhanceAnim,
    enhanceLog,
    enhanceTarget,
    expeditionCards,
    equipItem,
    equipToSlot,
    equipLootNow,
    expPct,
    filteredInv,
    filteredShop,
    closeReplay,
    handleTabSelect,
    handleBuyPotion,
    hasSellableInventory,
    initArena,
    invFilter,
    inventory,
    inventoryFilterOptions,
    inventoryItems,
    lootDrop,
    mercDungeonCards,
    mercSelectionCards,
    mercScrollsInInv,
    navTabs,
    openBattleReport,
    pSpec,
    placeBid,
    player,
    potionShopItems,
    potions,
    questBadgeCount,
    questNotify,
    questState,
    refreshShopCost,
    renderedQuestState,
    refreshAuction,
    refreshShop,
    replay,
    replaySummary,
    recovery,
    refreshTavern,
    restAtInn,
    tavernQuestState,
    tavernRestCost,
    reset,
    restartReplayBattle,
    save,
    saveMsg,
    selectedScrollObjs,
    selectedScrolls,
    sellListItems,
    sellThreshold,
    selectMercScrollFromInventory,
    sellItem,
    sellJunk,
    setBidInput,
    setEnhanceTarget,
    setInventory,
    setInvFilter,
    setLootDrop,
    setPlayer,
    setReplay,
    setSelectedScrolls,
    setSellThreshold,
    setShopFilter,
    setShopTab,
    setTab,
    shopFilter,
    shopDisplayItems,
    shopFilterOptions,
    shopItems,
    shopTabOptions,
    shopTab,
    SLOT_FILTERS,
    sortInventory,
    skipReplay,
    chooseClass,
    openClassModal,
    closeClassModal,
    classModalOpen,
    goToTavern,
    startArenaBattle,
    startBattle,
    startExpedition,
    startMercBattle,
    tAtk,
    tDef,
    trainingCards,
    tMhp,
    tSpd,
    tab,
    takeLoot,
    unequip,
    updateQuestProgress,
    updateBidInputValue,
    usePotion,
    useInventoryPotion,
    submitBid,
    toggleSelectedScroll,
    wCat,
    enhanceItems,
    synthesisCards,
    synthesisGoldCost,
    synthesisLog,
    synthesisResult,
    synthesisUids,
    doSynthesize,
    toggleSynthesisUid,
  };
}
