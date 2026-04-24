# Modular Rebuild Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the first stable module boundaries from `src/legacy/game.tsx` into focused `types`, `data`, `constants`, `persistence`, and low-risk `lib` modules while keeping the migrated game runnable throughout.

**Architecture:** Keep `src/legacy/game.tsx` as the active orchestration host and move only definition-layer code in this wave. Use transitional re-export shims for `src/game/types.ts`, `src/game/constants.ts`, and `src/game/persistence.ts` so existing imports can be rewired in small, safe batches instead of one risky cutover.

**Tech Stack:** React 19, TypeScript 5, Parcel 2, Vitest 3, jsdom, browser localStorage persistence

---

## File Structure

### Files to create

- `src/game/types/shared.ts` - shared slot ids and lightweight shared aliases
- `src/game/types/item.ts` - item, affix, and special shapes
- `src/game/types/player.ts` - player and equipment shapes
- `src/game/types/battle.ts` - replay and battle log shapes
- `src/game/types/quest.ts` - quest state shapes
- `src/game/types/arena.ts` - arena state and opponent shapes
- `src/game/types/save.ts` - save payload shape
- `src/game/types/index.ts` - type barrel for the split modules
- `src/game/constants/storage.ts` - storage keys and initial state factories
- `src/game/constants/ui.ts` - small shared display mappings used outside the legacy host
- `src/game/constants/index.ts` - constant barrel
- `src/game/persistence/index.ts` - persistence entrypoint under the new folder structure
- `src/game/data/equipmentSlots.ts` - equipment slot table
- `src/game/data/weaponCategories.ts` - weapon category table
- `src/game/data/enhanceLevels.ts` - enhancement progression table
- `src/game/data/trainStats.ts` - training stat table
- `src/game/data/itemBases.ts` - base item pools and flattened item list
- `src/game/data/rarities.ts` - rarity table
- `src/game/data/mercenaries.ts` - mercenary base data, scroll affixes, merc dungeon data
- `src/game/data/affixes.ts` - affix table
- `src/game/data/monsters.ts` - monster tables
- `src/game/data/expeditions.ts` - expedition table
- `src/game/data/dungeons.ts` - dungeon table
- `src/game/data/quests.ts` - quest definitions
- `src/game/data/arena.ts` - arena naming tables
- `src/game/lib/items.ts` - item/equipment-related pure helpers
- `src/game/lib/training.ts` - training-related pure helpers
- `src/game/lib/display.ts` - shared display lookup helpers
- `src/game/lib/items.test.ts` - tests for extracted item helpers
- `src/game/data/core-data.test.ts` - tests for first-wave extracted data
- `src/game/data/content-data.test.ts` - tests for second-wave extracted data

### Files to modify

- `src/game/types.ts` - convert to re-export shim during the split
- `src/game/constants.ts` - convert to re-export shim during the split
- `src/game/persistence.ts` - convert to re-export shim during the split
- `src/game/persistence.test.ts` - update imports to the new module structure
- `src/legacy/game.tsx` - replace local declarations with imports in small batches
- `src/legacy/game.test.ts` - update test target if train-stat display mapping moves out

### Existing source declarations to move verbatim

- `src/legacy/game.tsx:74-85` - `WEAPON_CATEGORIES`
- `src/legacy/game.tsx:87-96` - `EQUIP_SLOTS`
- `src/legacy/game.tsx:98-109` - `ENHANCE_LEVELS`
- `src/legacy/game.tsx:129-140` - `TRAIN_STATS` and `TRAIN_STAT_DISPLAY_KEYS`
- `src/legacy/game.tsx:146-220` - base equipment arrays and `ALL_BASE_ITEMS`
- `src/legacy/game.tsx:302-312` - `RARITIES`
- `src/legacy/game.tsx:317-391` - `MERC_BASES` and `MERC_SCROLL_AFFIXES`
- `src/legacy/game.tsx:393-412` - `AFFIXES`
- `src/legacy/game.tsx:414-435` - `MONSTERS`
- `src/legacy/game.tsx:437-450` - `EXPEDITIONS`
- `src/legacy/game.tsx:452-514` - `DUNGEONS`
- `src/legacy/game.tsx:516-778` - `MERC_DUNGEONS`
- `src/legacy/game.tsx:792-823` - `QUEST_DEFS`
- `src/legacy/game.tsx:871-873` - arena naming tables
- `src/legacy/game.tsx:111-143` and `src/legacy/game.tsx:222-230` - helper functions for enhancement, training, and item sell price

### Verification commands to use throughout

- `npm run typecheck`
- `npm test -- src/game/persistence.test.ts`
- `npm test -- src/legacy/game.test.ts`
- `npm test -- src/game/data/core-data.test.ts`
- `npm test -- src/game/data/content-data.test.ts`
- `npm test -- src/game/lib/items.test.ts`
- `npm test`

## Implementation Notes

- Keep `src/legacy/game.tsx` runnable after every task.
- Treat each extraction as a boundary move, not a behavior rewrite.
- Prefer moving declarations verbatim first, then tightening names and imports only when the moved code is green.
- Use `index.html` and the current migrated runtime only as behavior references, not as a reason to redesign data or balance.
- Keep the shim files until all consumers have moved; do not delete them in this plan.

### Task 1: Split Runtime Types Into Domain Files

**Files:**
- Create: `src/game/types/shared.ts`
- Create: `src/game/types/item.ts`
- Create: `src/game/types/player.ts`
- Create: `src/game/types/battle.ts`
- Create: `src/game/types/quest.ts`
- Create: `src/game/types/arena.ts`
- Create: `src/game/types/save.ts`
- Create: `src/game/types/index.ts`
- Modify: `src/game/types.ts`
- Test: `npm run typecheck`

- [ ] **Step 1: Write the split type modules and barrel**

```ts
// src/game/types/shared.ts
export const EQUIPMENT_SLOT_IDS = [
  "weapon",
  "offhand",
  "helmet",
  "armor",
  "gloves",
  "boots",
  "ring",
  "amulet",
] as const;

export type EquipmentSlotId = (typeof EQUIPMENT_SLOT_IDS)[number];
```

```ts
// src/game/types/item.ts
import type { RuntimeEquipment } from "./player";

export type RuntimeSpecial = {
  type?: string;
  val?: number;
  [key: string]: unknown;
};

export type RuntimeAffix = {
  id?: string;
  tag?: string;
  stat?: string;
  special?: string;
  rolledVal?: number;
  [key: string]: unknown;
};

export type RuntimeItem = {
  uid?: number | string;
  name?: string;
  icon?: string;
  slot?: string;
  type?: string;
  rarity?: string;
  cat?: string;
  attack?: number;
  defense?: number;
  hp?: number;
  speed?: number;
  heal?: number;
  enhLv?: number;
  itemLevel?: number;
  cost?: number;
  title?: string;
  equipment?: RuntimeEquipment;
  affixes?: RuntimeAffix[];
  specials?: RuntimeSpecial[];
  [key: string]: unknown;
};
```

```ts
// src/game/types/player.ts
import type { EquipmentSlotId } from "./shared";
import type { RuntimeItem } from "./item";

export type RuntimeEquipment = Record<EquipmentSlotId, RuntimeItem | null>;

export type RuntimePlayer = {
  name: string;
  level: number;
  exp: number;
  expNeeded: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  gold: number;
  equipment: RuntimeEquipment;
  trainedAtk: number;
  trainedDef: number;
  trainedHp: number;
  trainedSpd: number;
  totalKills: number;
  totalBossKills: number;
  totalDungeons: number;
  totalExpeditions: number;
  totalArenaWins: number;
  totalGoldEarned: number;
  totalEnhances: number;
  totalTrains: number;
  totalMercRuns: number;
  highestLevel: number;
  [key: string]: unknown;
};
```

```ts
// src/game/types/battle.ts
import type { RuntimeArenaOpponent } from "./arena";
import type { RuntimeItem } from "./item";

export type RuntimeLogEntry = {
  txt: string;
  type: string;
};

export type RuntimeReplay = {
  lines: RuntimeLogEntry[];
  cursor: number;
  drops: RuntimeItem[];
  won: boolean;
  isArena?: boolean;
  isExpedition?: boolean;
  isMerc?: boolean;
  dungeon?: RuntimeItem | null;
  tier?: RuntimeItem | null;
  expedition?: RuntimeItem | null;
  mercDungeonId?: string;
  opponent?: RuntimeArenaOpponent | null;
  [key: string]: unknown;
};
```

```ts
// src/game/types/quest.ts
export type RuntimeQuestProgressEntry = {
  collected: boolean;
  baseVal: number;
};

export type RuntimeQuestState = {
  progress: Record<string, RuntimeQuestProgressEntry>;
  dailyDate: string;
  weeklyDate: string;
};
```

```ts
// src/game/types/arena.ts
import type { RuntimeEquipment } from "./player";

export type RuntimeArenaOpponent = {
  id: number;
  name: string;
  title: string;
  level: number;
  tier: string;
  attack: number;
  defense: number;
  maxHp: number;
  hp: number;
  equipment: RuntimeEquipment;
  goldCarried: number;
  wcKey: string;
  wins: number;
  losses: number;
  [key: string]: unknown;
};

export type RuntimeArenaState = {
  arenaOpponents: RuntimeArenaOpponent[];
  arenaInjuredUntil: number;
  arenaRefreshes: number;
  arenaLastDate: string;
};
```

```ts
// src/game/types/save.ts
import type { RuntimeItem } from "./item";
import type { RuntimePlayer } from "./player";

export type GameSave = {
  player: RuntimePlayer;
  inventory: RuntimeItem[];
};
```

```ts
// src/game/types/index.ts
export * from "./shared";
export * from "./item";
export * from "./player";
export * from "./battle";
export * from "./quest";
export * from "./arena";
export * from "./save";
```

- [ ] **Step 2: Convert the legacy single-file type module into a shim**

```ts
// src/game/types.ts
export * from "./types";
```

- [ ] **Step 3: Run typecheck to verify the split is import-compatible**

Run: `npm run typecheck`
Expected: PASS with no new import or circular type errors

- [ ] **Step 4: Commit**

```bash
git add src/game/types.ts src/game/types
git commit -m "refactor: split runtime types into domain modules"
```

### Task 2: Move Constants And Persistence Behind Folder Boundaries

**Files:**
- Create: `src/game/constants/storage.ts`
- Create: `src/game/constants/ui.ts`
- Create: `src/game/constants/index.ts`
- Create: `src/game/persistence/index.ts`
- Modify: `src/game/constants.ts`
- Modify: `src/game/persistence.ts`
- Modify: `src/game/persistence.test.ts`
- Test: `src/game/persistence.test.ts`

- [ ] **Step 1: Create the new constants modules**

```ts
// src/game/constants/storage.ts
import { EQUIPMENT_SLOT_IDS, type RuntimeEquipment, type RuntimePlayer } from "../types";

export const STORAGE_KEYS = {
  player: "g_pl",
  inventory: "g_inv",
} as const;

export function createInitialEquipment(): RuntimeEquipment {
  return Object.fromEntries(
    EQUIPMENT_SLOT_IDS.map((slot) => [slot, null] as const),
  ) as RuntimeEquipment;
}

export function createInitialPlayer(): RuntimePlayer {
  return {
    name: "角鬥士",
    level: 1,
    exp: 0,
    expNeeded: 100,
    hp: 100,
    maxHp: 100,
    attack: 12,
    defense: 5,
    speed: 8,
    gold: 200,
    equipment: createInitialEquipment(),
    trainedAtk: 0,
    trainedDef: 0,
    trainedHp: 0,
    trainedSpd: 0,
    totalKills: 0,
    totalBossKills: 0,
    totalDungeons: 0,
    totalExpeditions: 0,
    totalArenaWins: 0,
    totalGoldEarned: 0,
    totalEnhances: 0,
    totalTrains: 0,
    totalMercRuns: 0,
    highestLevel: 1,
  };
}

export const INITIAL_EQUIPMENT = createInitialEquipment();
export const INITIAL_PLAYER = createInitialPlayer();
```

```ts
// src/game/constants/ui.ts
export const TRAIN_STAT_DISPLAY_KEYS = {
  trainedAtk: "attack",
  trainedDef: "defense",
  trainedSpd: "speed",
} as const;
```

```ts
// src/game/constants/index.ts
export * from "./storage";
export * from "./ui";
```

- [ ] **Step 2: Move persistence implementation to the folder entrypoint and shim the old path**

```ts
// src/game/persistence/index.ts
import {
  createInitialEquipment,
  createInitialPlayer,
  STORAGE_KEYS,
} from "../constants";
import {
  EQUIPMENT_SLOT_IDS,
  type EquipmentSlotId,
  type GameSave,
  type RuntimeEquipment,
  type RuntimeItem,
  type RuntimePlayer,
} from "../types";

// Move the current implementation from src/game/persistence.ts into this file verbatim.
// Keep function names unchanged: migrateGameState, loadGameState, saveGameState, clearGameState.
```

```ts
// src/game/constants.ts
export * from "./constants";
```

```ts
// src/game/persistence.ts
export * from "./persistence";
```

- [ ] **Step 3: Repoint persistence tests at the new modules**

```ts
// src/game/persistence.test.ts
import { describe, expect, it } from "vitest";

import { INITIAL_EQUIPMENT, INITIAL_PLAYER } from "./constants";
import {
  clearGameState,
  loadGameState,
  migrateGameState,
  saveGameState,
} from "./persistence";

// Keep the existing createStorage helper and all current test cases unchanged.
```

- [ ] **Step 4: Run the persistence tests**

Run: `npm test -- src/game/persistence.test.ts`
Expected: PASS with the same save compatibility assertions green

- [ ] **Step 5: Commit**

```bash
git add src/game/constants.ts src/game/constants src/game/persistence.ts src/game/persistence src/game/persistence.test.ts
git commit -m "refactor: move constants and persistence behind module folders"
```

### Task 3: Extract First-Wave Static Data Tables

**Files:**
- Create: `src/game/data/equipmentSlots.ts`
- Create: `src/game/data/weaponCategories.ts`
- Create: `src/game/data/enhanceLevels.ts`
- Create: `src/game/data/trainStats.ts`
- Create: `src/game/data/itemBases.ts`
- Create: `src/game/data/core-data.test.ts`
- Modify: `src/legacy/game.tsx`
- Test: `src/game/data/core-data.test.ts`

- [ ] **Step 1: Move the lowest-risk static tables into data modules**

```ts
// src/game/data/equipmentSlots.ts
export const EQUIP_SLOTS = [
  { id: "weapon", label: "武器", icon: "⚔️", row: 0 },
  { id: "offhand", label: "副手", icon: "🛡️", row: 0 },
  { id: "helmet", label: "頭盔", icon: "⛑️", row: 1 },
  { id: "armor", label: "胸甲", icon: "🥋", row: 1 },
  { id: "gloves", label: "手套", icon: "🧤", row: 2 },
  { id: "boots", label: "靴子", icon: "👢", row: 2 },
  { id: "ring", label: "戒指", icon: "💍", row: 3 },
  { id: "amulet", label: "護符", icon: "📿", row: 3 },
] as const;
```

```ts
// src/game/data/weaponCategories.ts
export const WEAPON_CATEGORIES = {
  sword: { label: "劍", icon: "⚔️", trait: "balanced", traitDesc: "平衡型，無特殊效果" },
  dagger: { label: "匕首", icon: "🗡️", trait: "swift", traitDesc: "速度+3，首回合傷害×1.5" },
  axe: { label: "斧", icon: "🪓", trait: "armorbreak", traitDesc: "無視敵方 20% 防禦" },
  hammer: { label: "錘", icon: "🔨", trait: "stun", traitDesc: "10% 機率使敵人本回合無法攻擊" },
  spear: { label: "長矛", icon: "🏹", trait: "firstblood", traitDesc: "先手攻擊，永遠先出手" },
  trident: { label: "三叉戟", icon: "🔱", trait: "bleed", traitDesc: "造成流血，每回合額外 3 傷害" },
  sickle: { label: "鐮刀", icon: "☽", trait: "crit_boost", traitDesc: "爆擊率額外 +10%" },
  angel: { label: "死亡天使", icon: "🪽", trait: "soulstrike", traitDesc: "低血時傷害+50%（敵人HP<30%）" },
  club: { label: "棍棒", icon: "🪵", trait: "bonecrush", traitDesc: "每回合額外 2 點固定傷害" },
  staff: { label: "法杖", icon: "🪄", trait: "spellpower", traitDesc: "吸血效果翻倍" },
} as const;
```

```ts
// src/game/data/enhanceLevels.ts
export const ENHANCE_LEVELS = [
  { lv: 1, rate: 0.9, costMult: 1.0, bonus: 0.08 },
  { lv: 2, rate: 0.85, costMult: 1.2, bonus: 0.08 },
  { lv: 3, rate: 0.8, costMult: 1.5, bonus: 0.1 },
  { lv: 4, rate: 0.65, costMult: 2.0, bonus: 0.1 },
  { lv: 5, rate: 0.55, costMult: 3.0, bonus: 0.12 },
  { lv: 6, rate: 0.45, costMult: 4.5, bonus: 0.12 },
  { lv: 7, rate: 0.35, costMult: 6.5, bonus: 0.15 },
  { lv: 8, rate: 0.25, costMult: 9.0, bonus: 0.15 },
  { lv: 9, rate: 0.15, costMult: 13.0, bonus: 0.2 },
  { lv: 10, rate: 0.08, costMult: 20.0, bonus: 0.2 },
] as const;
```

```ts
// src/game/data/trainStats.ts
export const TRAIN_STATS = [
  { id: "trainedAtk", label: "攻擊力", icon: "⚔️", color: "#c8781e", desc: "永久提升基礎攻擊" },
  { id: "trainedDef", label: "防禦力", icon: "🛡️", color: "#4a9fd4", desc: "永久提升基礎防禦" },
  { id: "trainedHp", label: "生命值", icon: "❤️", color: "#c84040", desc: "永久提升最大HP", hpStat: true },
  { id: "trainedSpd", label: "速度", icon: "💨", color: "#4caf50", desc: "永久提升速度" },
] as const;
```

```ts
// src/game/data/itemBases.ts
// Move BASE_WEAPONS, BASE_OFFHANDS, BASE_HELMETS, BASE_ARMORS, BASE_GLOVES,
// BASE_BOOTS, BASE_RINGS, BASE_AMULETS, and ALL_BASE_ITEMS from src/legacy/game.tsx verbatim.
// Keep export names unchanged so the legacy host can switch imports mechanically.
```

- [ ] **Step 2: Add a core-data regression test**

```ts
// src/game/data/core-data.test.ts
import { describe, expect, it } from "vitest";

import { ENHANCE_LEVELS } from "./enhanceLevels";
import { EQUIP_SLOTS } from "./equipmentSlots";
import { ALL_BASE_ITEMS, BASE_WEAPONS } from "./itemBases";
import { TRAIN_STATS } from "./trainStats";
import { WEAPON_CATEGORIES } from "./weaponCategories";

describe("first-wave extracted data", () => {
  it("keeps the canonical equipment slot order", () => {
    expect(EQUIP_SLOTS.map((slot) => slot.id)).toEqual([
      "weapon",
      "offhand",
      "helmet",
      "armor",
      "gloves",
      "boots",
      "ring",
      "amulet",
    ]);
  });

  it("keeps expected combat data anchors", () => {
    expect(WEAPON_CATEGORIES.sword.trait).toBe("balanced");
    expect(WEAPON_CATEGORIES.staff.trait).toBe("spellpower");
    expect(ENHANCE_LEVELS).toHaveLength(10);
    expect(ENHANCE_LEVELS[0].rate).toBe(0.9);
    expect(TRAIN_STATS.find((entry) => entry.id === "trainedHp")?.hpStat).toBe(true);
    expect(BASE_WEAPONS.some((item) => item.name === "短劍")).toBe(true);
    expect(ALL_BASE_ITEMS.length).toBeGreaterThan(BASE_WEAPONS.length);
  });
});
```

- [ ] **Step 3: Rewire the legacy host to import the extracted tables and delete the local declarations**

```ts
// src/legacy/game.tsx
import { ENHANCE_LEVELS } from "../game/data/enhanceLevels";
import { EQUIP_SLOTS } from "../game/data/equipmentSlots";
import { ALL_BASE_ITEMS, BASE_WEAPONS } from "../game/data/itemBases";
import { TRAIN_STATS } from "../game/data/trainStats";
import { WEAPON_CATEGORIES } from "../game/data/weaponCategories";

// Remove the local declarations for these constants after the imports are in place.
```

- [ ] **Step 4: Run the focused tests and typecheck**

Run: `npm test -- src/game/data/core-data.test.ts && npm run typecheck`
Expected: PASS with the new data modules imported and no duplicate identifier errors left in `src/legacy/game.tsx`

- [ ] **Step 5: Commit**

```bash
git add src/game/data src/legacy/game.tsx
git commit -m "refactor: extract first-wave game data tables"
```

### Task 4: Extract Second-Wave Static Content Tables

**Files:**
- Create: `src/game/data/rarities.ts`
- Create: `src/game/data/mercenaries.ts`
- Create: `src/game/data/affixes.ts`
- Create: `src/game/data/monsters.ts`
- Create: `src/game/data/expeditions.ts`
- Create: `src/game/data/dungeons.ts`
- Create: `src/game/data/quests.ts`
- Create: `src/game/data/arena.ts`
- Create: `src/game/data/content-data.test.ts`
- Modify: `src/legacy/game.tsx`
- Test: `src/game/data/content-data.test.ts`

- [ ] **Step 1: Move the higher-coupling content tables into data modules**

```ts
// src/game/data/rarities.ts
// Move RARITIES from src/legacy/game.tsx:302-312 verbatim and export it.
```

```ts
// src/game/data/mercenaries.ts
// Move MERC_BASES, MERC_SCROLL_AFFIXES, and MERC_DUNGEONS from
// src/legacy/game.tsx:317-391 and 516-778 verbatim and export them.
```

```ts
// src/game/data/affixes.ts
// Move AFFIXES from src/legacy/game.tsx:393-412 verbatim and export it.
```

```ts
// src/game/data/monsters.ts
// Move MONSTERS from src/legacy/game.tsx:414-435 verbatim and export it.
```

```ts
// src/game/data/expeditions.ts
// Move EXPEDITIONS from src/legacy/game.tsx:437-450 verbatim and export it.
```

```ts
// src/game/data/dungeons.ts
// Move DUNGEONS from src/legacy/game.tsx:452-514 verbatim and export it.
```

```ts
// src/game/data/quests.ts
// Move QUEST_DEFS from src/legacy/game.tsx:792-823 verbatim and export it.
```

```ts
// src/game/data/arena.ts
export const ARENA_FIRST_NAMES = ["鐵拳", "烈焰", "暗影", "血刃", "雷霆", "冰霜", "狂狼", "死神", "石壁", "毒牙", "金鷹", "黑熊", "赤龍", "幽靈", "鋼爪"] as const;
export const ARENA_LAST_NAMES = ["戰士", "屠夫", "獵人", "武者", "刺客", "法師", "騎士", "守衛", "劊子手", "征服者", "破壞者", "裁判者"] as const;
export const ARENA_TITLES = ["不敗的", "嗜血的", "冷酷的", "無情的", "狂暴的", "沉默的", "傳奇的", "恐怖的", "古老的", "神秘的"] as const;
```

- [ ] **Step 2: Add a content-data regression test**

```ts
// src/game/data/content-data.test.ts
import { describe, expect, it } from "vitest";

import { AFFIXES } from "./affixes";
import { ARENA_FIRST_NAMES, ARENA_LAST_NAMES, ARENA_TITLES } from "./arena";
import { DUNGEONS } from "./dungeons";
import { EXPEDITIONS } from "./expeditions";
import { MERC_BASES, MERC_DUNGEONS, MERC_SCROLL_AFFIXES } from "./mercenaries";
import { MONSTERS } from "./monsters";
import { QUEST_DEFS } from "./quests";
import { RARITIES } from "./rarities";

describe("second-wave extracted content", () => {
  it("preserves representative content anchors", () => {
    expect(RARITIES[0]?.id).toBe("normal");
    expect(AFFIXES.length).toBeGreaterThan(0);
    expect(Object.keys(MONSTERS).length).toBeGreaterThan(0);
    expect(EXPEDITIONS.length).toBeGreaterThan(0);
    expect(DUNGEONS.length).toBeGreaterThan(0);
    expect(MERC_BASES.length).toBeGreaterThan(0);
    expect(MERC_SCROLL_AFFIXES.length).toBeGreaterThan(0);
    expect(MERC_DUNGEONS.length).toBeGreaterThan(0);
    expect(Object.keys(QUEST_DEFS)).toContain("d1");
    expect(ARENA_FIRST_NAMES).toContain("鐵拳");
    expect(ARENA_LAST_NAMES).toContain("戰士");
    expect(ARENA_TITLES).toContain("傳奇的");
  });
});
```

- [ ] **Step 3: Rewire the legacy host to import the extracted content tables and delete the local declarations**

```ts
// src/legacy/game.tsx
import { AFFIXES } from "../game/data/affixes";
import { ARENA_FIRST_NAMES, ARENA_LAST_NAMES, ARENA_TITLES } from "../game/data/arena";
import { DUNGEONS } from "../game/data/dungeons";
import { EXPEDITIONS } from "../game/data/expeditions";
import { MERC_BASES, MERC_DUNGEONS, MERC_SCROLL_AFFIXES } from "../game/data/mercenaries";
import { MONSTERS } from "../game/data/monsters";
import { QUEST_DEFS } from "../game/data/quests";
import { RARITIES } from "../game/data/rarities";

// Remove the matching local declarations after the imports compile cleanly.
```

- [ ] **Step 4: Run the focused tests and typecheck**

Run: `npm test -- src/game/data/content-data.test.ts && npm run typecheck`
Expected: PASS with no unresolved identifiers for content tables in `src/legacy/game.tsx`

- [ ] **Step 5: Commit**

```bash
git add src/game/data src/legacy/game.tsx
git commit -m "refactor: extract second-wave game content tables"
```

### Task 5: Extract Low-Risk Pure Helpers And Move The Display Mapping Test

**Files:**
- Create: `src/game/lib/items.ts`
- Create: `src/game/lib/training.ts`
- Create: `src/game/lib/display.ts`
- Create: `src/game/lib/items.test.ts`
- Modify: `src/legacy/game.tsx`
- Modify: `src/legacy/game.test.ts`
- Test: `src/game/lib/items.test.ts`
- Test: `src/legacy/game.test.ts`

- [ ] **Step 1: Move the independent helper functions into `lib` modules**

```ts
// src/game/lib/items.ts
import { ENHANCE_LEVELS } from "../data/enhanceLevels";

export function calcSellPrice(item: any) {
  if (!item) return 0;
  const rarMult = ({ normal: 1, magic: 2.5, rare: 6, legendary: 15, mythic: 35 } as Record<string, number>)[item.rarity || "normal"] || 1;
  const statSum = (item.attack || 0) + (item.defense || 0) + (item.hp || 0) * 0.4 + (item.speed || 0) * 2;
  const lvMult = item.itemLevel ? 1 + item.itemLevel * 0.05 : 1;
  if (item.type === "potion") return Math.max(5, Math.floor(item.cost * 0.4 || 10));
  if (item.type === "merc_scroll") return Math.floor(30 * rarMult);
  return Math.max(5, Math.floor(statSum * rarMult * lvMult * 0.4));
}

export function applyEnhanceBonus(item: any) {
  if (!item.enhLv || item.enhLv === 0) return item;
  const totalBonus = ENHANCE_LEVELS.slice(0, item.enhLv).reduce((sum, level) => sum + level.bonus, 0);
  return {
    ...item,
    attack: Math.floor((item.baseAttack || item.attack || 0) * (1 + totalBonus)),
    defense: Math.floor((item.baseDefense || item.defense || 0) * (1 + totalBonus)),
    hp: Math.floor((item.baseHp || item.hp || 0) * (1 + totalBonus)),
    speed: Math.floor((item.baseSpeed || item.speed || 0) * (1 + totalBonus)),
  };
}

export function enhanceCost(item: any) {
  const base = Math.max(30, calcSellPrice(item) * 1.5);
  const lvData = ENHANCE_LEVELS[item.enhLv || 0];
  return lvData ? Math.floor(base * lvData.costMult) : 0;
}
```

```ts
// src/game/lib/training.ts
export function trainCost(playerLevel: number, currentTrained: number) {
  return Math.max(5, Math.floor(playerLevel * 5 + currentTrained * 8));
}
```

```ts
// src/game/lib/display.ts
import { TRAIN_STAT_DISPLAY_KEYS } from "../constants";

export { TRAIN_STAT_DISPLAY_KEYS };
```

- [ ] **Step 2: Add focused helper tests**

```ts
// src/game/lib/items.test.ts
import { describe, expect, it } from "vitest";

import { applyEnhanceBonus, calcSellPrice, enhanceCost } from "./items";

describe("item helpers", () => {
  it("applies enhancement bonuses cumulatively", () => {
    const item = applyEnhanceBonus({ attack: 10, enhLv: 2 });
    expect(item.attack).toBe(11);
  });

  it("calculates mercenary scroll price from rarity", () => {
    expect(calcSellPrice({ type: "merc_scroll", rarity: "rare" })).toBe(180);
  });

  it("calculates enhancement cost from sell price tiers", () => {
    expect(enhanceCost({ attack: 10, rarity: "normal", enhLv: 1 })).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Move the train-stat mapping test target and rewire the legacy host imports**

```ts
// src/legacy/game.test.ts
import { describe, expect, it } from "vitest";

import { TRAIN_STAT_DISPLAY_KEYS } from "../game/lib/display";

describe("train stat display mapping", () => {
  it("uses concrete player stat keys instead of derived abbreviations", () => {
    expect(TRAIN_STAT_DISPLAY_KEYS.trainedAtk).toBe("attack");
    expect(TRAIN_STAT_DISPLAY_KEYS.trainedDef).toBe("defense");
    expect(TRAIN_STAT_DISPLAY_KEYS.trainedSpd).toBe("speed");
  });
});
```

```ts
// src/legacy/game.tsx
import { TRAIN_STAT_DISPLAY_KEYS } from "../game/lib/display";
import { calcSellPrice, applyEnhanceBonus, enhanceCost } from "../game/lib/items";
import { trainCost } from "../game/lib/training";

// Remove the local helper implementations after the imports compile cleanly.
```

- [ ] **Step 4: Run focused helper tests and the legacy test**

Run: `npm test -- src/game/lib/items.test.ts && npm test -- src/legacy/game.test.ts && npm run typecheck`
Expected: PASS with the helper exports green and no missing-symbol errors in the legacy host

- [ ] **Step 5: Commit**

```bash
git add src/game/lib src/legacy/game.tsx src/legacy/game.test.ts
git commit -m "refactor: extract low-risk gameplay helpers"
```

### Task 6: Final Verification And Boundary Cleanup

**Files:**
- Modify: `src/legacy/game.tsx`
- Modify: `src/game/persistence.test.ts`
- Modify: `src/legacy/game.test.ts`
- Test: full suite and manual smoke checks

- [ ] **Step 1: Remove any now-dead duplicate declarations left in the legacy host**

```ts
// src/legacy/game.tsx
// Delete any remaining duplicate declarations for:
// WEAPON_CATEGORIES, EQUIP_SLOTS, ENHANCE_LEVELS, TRAIN_STATS,
// TRAIN_STAT_DISPLAY_KEYS, base item arrays, RARITIES, MERC_BASES,
// MERC_SCROLL_AFFIXES, AFFIXES, MONSTERS, EXPEDITIONS, DUNGEONS,
// MERC_DUNGEONS, QUEST_DEFS, arena naming tables, calcSellPrice,
// applyEnhanceBonus, enhanceCost, and trainCost.
```

- [ ] **Step 2: Run the complete automated verification set**

Run: `npm run typecheck && npm test`
Expected: PASS with all persistence, legacy, data, and helper tests green

- [ ] **Step 3: Run the manual smoke checklist in the dev server**

Run: `npm run dev`
Expected:
- App mounts without a white screen
- Existing save still loads
- Character, inventory, and shop views open
- One battle or expedition flow can be triggered
- Refresh restores the same save state

- [ ] **Step 4: Commit**

```bash
git add src/legacy/game.tsx src/game src/legacy/game.test.ts
git commit -m "refactor: complete modular rebuild foundation extraction"
```
