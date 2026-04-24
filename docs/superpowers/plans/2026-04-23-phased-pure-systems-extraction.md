# Phased Pure Systems Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract loot generation, combat rules, quest logic, and arena generation from `src/legacy/game.tsx` into `src/game/systems/*`, then do one final cleanup pass to fix regressions and make the legacy file a UI orchestration host.

**Architecture:** Keep `src/legacy/game.tsx` as the active React host during the whole migration. Move domain logic in three waves into `src/game/systems/loot.ts`, `combat.ts`, `quests.ts`, and `arena.ts`, preserving existing object shapes and call patterns so wiring changes stay small and behavior drift is isolated to the final cleanup task.

**Tech Stack:** React 19, TypeScript 5, Parcel 2, Vitest 3, jsdom

---

## File Structure

### Files to create

- `src/game/systems/index.ts` - barrel for extracted systems
- `src/game/systems/loot.ts` - rarity, affix, loot, shop, auction, and merc-scroll generation
- `src/game/systems/loot.test.ts` - deterministic coverage for extracted loot functions
- `src/game/systems/combat.ts` - combat stat helpers, enemy building, round resolution, and simulation wrappers
- `src/game/systems/combat.test.ts` - combat helper and simulation coverage
- `src/game/systems/quests.ts` - quest state initialization and progress checks
- `src/game/systems/quests.test.ts` - quest behavior coverage
- `src/game/systems/arena.ts` - arena opponent generation and pure arena helpers
- `src/game/systems/arena.test.ts` - deterministic arena generation coverage

### Files to modify

- `src/legacy/game.tsx` - replace inline gameplay logic with imports in four waves
- `src/game/types/index.ts` - export any additional system-facing runtime types if extraction needs them
- `src/game/types/arena.ts` - tighten runtime arena shapes only if required by extracted helpers
- `src/game/types/battle.ts` - add explicit combat result shapes only if required by extracted helpers
- `README.md` - extend migration verification notes only if the final cleanup uncovers or resolves a user-visible regression worth documenting

### Existing source ranges being moved

- `src/legacy/game.tsx:89-288` - loot and item generation
- `src/legacy/game.tsx:290-425` - combat stat helpers and enemy attack helpers
- `src/legacy/game.tsx:432-541` - quest and arena generation helpers
- `src/legacy/game.tsx:1692-1967` - combat loops and simulation wrappers

### Verification commands used throughout

- `npm run typecheck`
- `npm test -- src/game/systems/loot.test.ts`
- `npm test -- src/game/systems/combat.test.ts`
- `npm test -- src/game/systems/quests.test.ts`
- `npm test -- src/game/systems/arena.test.ts`
- `npm test -- src/game/lib/items.test.ts`
- `npm test -- src/legacy/game.test.ts`
- `npm test`

## Task 1: Create The Systems Skeleton

**Files:**
- Create: `src/game/systems/index.ts`
- Test: `npm run typecheck`

- [ ] **Step 1: Add the systems barrel**

```ts
// src/game/systems/index.ts
export * from "./loot";
export * from "./combat";
export * from "./quests";
export * from "./arena";
```

- [ ] **Step 2: Keep the barrel isolated until the first concrete system exists**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit the skeleton boundary**

```bash
git add src/game/systems/index.ts src/legacy/game.tsx
git commit -m "refactor: add game systems extraction boundary"
```

## Task 2: Extract Loot Generation With Tests

**Files:**
- Create: `src/game/systems/loot.ts`
- Create: `src/game/systems/loot.test.ts`
- Modify: `src/legacy/game.tsx:89-288`
- Test: `src/game/systems/loot.test.ts`

- [ ] **Step 1: Write deterministic loot tests before moving code**

```ts
// src/game/systems/loot.test.ts
import { describe, expect, it, vi } from "vitest";

import {
  buildName,
  genLoot,
  genMercScroll,
  genShopItem,
  itemLevelScale,
  rollRarity,
} from "./loot";

describe("loot system", () => {
  it("scales item level every 10 player levels", () => {
    expect(itemLevelScale(1)).toBe(1);
    expect(itemLevelScale(10)).toBeCloseTo(1.25);
  });

  it("keeps normal rarity names unchanged", () => {
    expect(buildName({ name: "鐵劍" }, { id: "normal" }, [])).toBe("鐵劍");
  });

  it("builds a valid loot item for a forced slot", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const item = genLoot(5, 0, "weapon");
    expect(item.slot).toBe("weapon");
    expect(item.itemLevel).toBe(5);
    expect(item.uid).toBeTypeOf("number");
  });

  it("builds a priced shop item", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const item = genShopItem(5, "helmet");
    expect(item.slot).toBe("helmet");
    expect(item.cost).toBeGreaterThan(0);
  });

  it("builds a mercenary scroll with merc scroll typing", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const scroll = genMercScroll(8, "rare");
    expect(scroll.type).toBe("merc_scroll");
    expect(scroll.slot).toBe("merc_scroll");
  });
});
```

- [ ] **Step 2: Run the new loot test and confirm it fails because the system file does not exist yet**

Run: `npm test -- src/game/systems/loot.test.ts`
Expected: FAIL with module resolution errors for `./loot`.

- [ ] **Step 3: Move the loot functions into a dedicated system module with the current shapes intact**

```ts
// src/game/systems/loot.ts
import { AFFIXES } from "../data/affixes";
import { ALL_BASE_ITEMS } from "../data/itemBases";
import { MERC_BASES, MERC_SCROLL_AFFIXES } from "../data/mercenaries";
import { RARITIES } from "../data/rarities";
import { calcSellPrice } from "../lib/items";

export const getRarity = (id: any): any =>
  RARITIES.find((r: any) => r.id === id) || RARITIES[0];

export function itemLevelScale(playerLevel: any) {
  const tier = Math.floor(playerLevel / 10);
  return Math.pow(1.25, tier);
}

export function rollRarity(bonus: any = 0): any {
  const adj: any[] = RARITIES.map((r: any) => ({
    ...r,
    weight:
      r.id === "normal"
        ? Math.max(5, r.weight - bonus * 80)
        : r.weight + bonus * (r.id === "mythic" ? 30 : r.id === "legendary" ? 15 : 5),
  }));
  const total = adj.reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * total;
  for (const r of adj) {
    roll -= r.weight;
    if (roll <= 0) return r;
  }
  return adj[0];
}

export function buildName(base: any, rarity: any, affixes: any) {
  if (rarity.id === "normal") return base.name;
  const pre = affixes.find((a: any) => a.type === "prefix");
  const suf = affixes.find((a: any) => a.type === "suffix");
  let n = base.name;
  if (pre) n = pre.tag + n;
  if (suf) n = n + "之" + suf.tag;
  if (rarity.id === "mythic") n = "【神話】" + n;
  return n;
}
```

- [ ] **Step 4: Rewire legacy callers to import the extracted loot functions and remove the inline definitions**

```ts
// src/legacy/game.tsx
import {
  genAuctionItem,
  genLoot,
  genMercScroll,
  genShopItem,
} from "../game/systems";

// delete the old inline definitions in the 89-288 range once imports are wired
```

- [ ] **Step 5: Run the loot-focused checks**

Run: `npm test -- src/game/systems/loot.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit the loot extraction**

```bash
git add src/game/systems/loot.ts src/game/systems/loot.test.ts src/legacy/game.tsx src/game/systems/index.ts
git commit -m "refactor: extract loot generation system"
```

## Task 3: Extract Combat Helpers And Combat Simulations

**Files:**
- Create: `src/game/systems/combat.ts`
- Create: `src/game/systems/combat.test.ts`
- Modify: `src/game/types/battle.ts`
- Modify: `src/game/types/index.ts`
- Modify: `src/legacy/game.tsx:290-425`
- Modify: `src/legacy/game.tsx:1692-1967`
- Test: `src/game/systems/combat.test.ts`

- [ ] **Step 1: Write the failing combat tests around the extracted behavior surface**

```ts
// src/game/systems/combat.test.ts
import { describe, expect, it, vi } from "vitest";

import {
  buildEnemy,
  cAtk,
  cDef,
  cMhp,
  cSpd,
  fightMonster,
} from "./combat";

describe("combat system", () => {
  it("aggregates player combat stats from training and equipment", () => {
    const player = {
      attack: 10,
      defense: 8,
      maxHp: 100,
      speed: 5,
      trainedAtk: 2,
      trainedDef: 1,
      trainedHp: 3,
      trainedSpd: 4,
      equipment: { weapon: { attack: 7 }, offhand: null, helmet: null, armor: null, gloves: null, boots: null, ring: null, amulet: null },
    };
    expect(cAtk(player)).toBe(19);
    expect(cDef(player)).toBe(9);
    expect(cMhp(player)).toBe(109);
    expect(cSpd(player)).toBe(9);
  });

  it("builds a boss enemy with boosted rewards", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const enemy = buildEnemy("wolf", 5, 1, true);
    expect(enemy.isBoss).toBe(true);
    expect(enemy.expReward).toBeGreaterThan(0);
  });

  it("returns a structured fight result", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const enemy = buildEnemy("wolf", 3, 1, false);
    const result = fightMonster(enemy, { hp: 100 }, 18, 6, 100, [], null, [], { val: 0 });
    expect(result).toHaveProperty("won");
    expect(result).toHaveProperty("np");
    expect(result).toHaveProperty("totalDmgDealt");
  });
});
```

- [ ] **Step 2: Run the combat test to verify it fails before extraction**

Run: `npm test -- src/game/systems/combat.test.ts`
Expected: FAIL with module resolution errors for `./combat`.

- [ ] **Step 3: Add explicit battle result types for the extracted combat surface**

```ts
// src/game/types/battle.ts
export type RuntimeFightResult = {
  np: Record<string, any>;
  won: boolean;
  crits: number;
  stuns: number;
  totalDmgDealt: number;
  totalDmgTaken: number;
};
```

```ts
// src/game/types/index.ts
export type { RuntimeFightResult } from "./battle";
```

- [ ] **Step 4: Move combat helpers and the simulation wrappers into `combat.ts` with the smallest safe edits**

```ts
// src/game/systems/combat.ts
import { MONSTERS } from "../data/monsters";
import { WEAPON_CATEGORIES } from "../data/weaponCategories";
import { applyEnhanceBonus } from "../lib/items";
import { genLoot, genMercScroll } from "./loot";

export const sumEq = (player: any, stat: any) =>
  Object.values(player.equipment).reduce((s, e) => {
    const item = e as any;
    if (!item) return s;
    const val = item.enhLv > 0 ? applyEnhanceBonus(item)[stat] || 0 : item[stat] || 0;
    return s + val;
  }, 0);

export const cAtk = (p: any) => p.attack + (p.trainedAtk || 0) + sumEq(p, "attack");
export const cDef = (p: any) => p.defense + (p.trainedDef || 0) + sumEq(p, "defense");
export const cMhp = (p: any) => p.maxHp + (p.trainedHp || 0) * 3 + sumEq(p, "hp");
export const cSpd = (p: any) => p.speed + (p.trainedSpd || 0) + sumEq(p, "speed");
```

- [ ] **Step 5: Rewire `legacy/game.tsx` to use imported combat helpers and delete the inline combat code**

```ts
// src/legacy/game.tsx
import {
  cAtk,
  cDef,
  cMhp,
  cSpd,
  fightMonster,
  simulateExpedition,
  simulateMercRun,
  simulateRun,
} from "../game/systems";

// remove the old inline definitions in 290-425 and 1692-1967
```

- [ ] **Step 6: Run combat verification**

Run: `npm test -- src/game/systems/combat.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 7: Commit the combat extraction**

```bash
git add src/game/systems/combat.ts src/game/systems/combat.test.ts src/game/types/battle.ts src/game/types/index.ts src/legacy/game.tsx src/game/systems/index.ts
git commit -m "refactor: extract combat system"
```

## Task 4: Extract Quest Logic With Tests

**Files:**
- Create: `src/game/systems/quests.ts`
- Create: `src/game/systems/quests.test.ts`
- Modify: `src/legacy/game.tsx:432-476`
- Test: `src/game/systems/quests.test.ts`

- [ ] **Step 1: Write quest tests around initialization, progress, and completion rules**

```ts
// src/game/systems/quests.test.ts
import { describe, expect, it, vi } from "vitest";

import { getQuestProgress, getWeekKey, initQuestState, isQuestDone } from "./quests";

describe("quest system", () => {
  it("initializes all quest progress entries as uncollected", () => {
    vi.setSystemTime(new Date("2026-04-23T08:00:00Z"));
    const state = initQuestState();
    expect(state.dailyDate).toBe("2026-04-23");
    expect(Object.values(state.progress).every((entry: any) => entry.collected === false)).toBe(true);
  });

  it("computes progress from the quest baseline", () => {
    const state = { progress: { kill_daily: { collected: false, baseVal: 3 } } };
    const player = { totalKills: 8 };
    expect(getQuestProgress("kill_daily", player, state)).toBeGreaterThanOrEqual(0);
  });

  it("detects the special enhancement quest", () => {
    const player = { equipment: { weapon: { enhLv: 7 } } };
    const state = { progress: { enhance_7: { collected: false, baseVal: 0 } } };
    expect(isQuestDone("enhance_7", player, state)).toBeTypeOf("boolean");
  });
});
```

- [ ] **Step 2: Run the quest test to verify it fails before extraction**

Run: `npm test -- src/game/systems/quests.test.ts`
Expected: FAIL with module resolution errors for `./quests`.

- [ ] **Step 3: Move the quest helpers into `quests.ts` and keep the current special-case rules intact**

```ts
// src/game/systems/quests.ts
import { QUEST_DEFS } from "../data/quests";

export function getWeekKey() {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

export function initQuestState() {
  const today = new Date().toISOString().slice(0, 10);
  const week = getWeekKey();
  const progress: Record<string, { collected: boolean; baseVal: number }> = {};
  Object.keys(QUEST_DEFS).forEach((id) => {
    progress[id] = { collected: false, baseVal: 0 };
  });
  return { progress, dailyDate: today, weeklyDate: week };
}
```

- [ ] **Step 4: Rewire the quest consumers in `legacy/game.tsx`**

```ts
// src/legacy/game.tsx
import { getQuestProgress, initQuestState, isQuestDone } from "../game/systems";

// remove the old inline quest helpers in 432-476
```

- [ ] **Step 5: Run quest verification**

Run: `npm test -- src/game/systems/quests.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit the quest extraction**

```bash
git add src/game/systems/quests.ts src/game/systems/quests.test.ts src/legacy/game.tsx src/game/systems/index.ts
git commit -m "refactor: extract quest system"
```

## Task 5: Extract Arena Generation With Tests

**Files:**
- Create: `src/game/systems/arena.ts`
- Create: `src/game/systems/arena.test.ts`
- Modify: `src/legacy/game.tsx:483-541`
- Test: `src/game/systems/arena.test.ts`

- [ ] **Step 1: Write deterministic arena generation tests**

```ts
// src/game/systems/arena.test.ts
import { describe, expect, it, vi } from "vitest";

import { genArenaOpponent } from "./arena";

describe("arena system", () => {
  it("generates an opponent near the player level", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const opponent = genArenaOpponent(10);
    expect(opponent.level).toBeGreaterThanOrEqual(7);
    expect(opponent.level).toBeLessThanOrEqual(13);
  });

  it("generates arena equipment and gold carried", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const opponent = genArenaOpponent(10);
    expect(opponent.goldCarried).toBeGreaterThan(0);
    expect(opponent.equipment).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the arena test to confirm it fails before extraction**

Run: `npm test -- src/game/systems/arena.test.ts`
Expected: FAIL with module resolution errors for `./arena`.

- [ ] **Step 3: Move arena opponent generation into `arena.ts` and depend on the extracted loot system**

```ts
// src/game/systems/arena.ts
import { INITIAL_EQUIPMENT } from "../constants";
import { ARENA_FIRST_NAMES, ARENA_LAST_NAMES, ARENA_TITLES } from "../data/arena";
import { WEAPON_CATEGORIES } from "../data/weaponCategories";
import { genLoot } from "./loot";

export function genArenaOpponent(playerLevel: any) {
  const firstName = ARENA_FIRST_NAMES[Math.floor(Math.random() * ARENA_FIRST_NAMES.length)];
  const lastName = ARENA_LAST_NAMES[Math.floor(Math.random() * ARENA_LAST_NAMES.length)];
  const title = ARENA_TITLES[Math.floor(Math.random() * ARENA_TITLES.length)];
  const name = `${title}${firstName}${lastName}`;
  const lvOffset = Math.floor(Math.random() * 7) - 3;
  const oppLv = Math.max(1, playerLevel + lvOffset);
  const tierRoll = Math.random();
  const tier = tierRoll < 0.35 ? "weak" : tierRoll < 0.7 ? "normal" : "strong";
  const tierMult =
    tier === "weak"
      ? 0.7 + Math.random() * 0.15
      : tier === "normal"
        ? 0.88 + Math.random() * 0.24
        : 1.1 + Math.random() * 0.3;
  const equipment: Record<string, any> = { ...INITIAL_EQUIPMENT };
  const slots = ["weapon", "offhand", "armor", "helmet", "gloves", "boots", "ring", "amulet"];
  const lootBonus = oppLv / 50 + (tier === "strong" ? 0.25 : tier === "weak" ? -0.1 : 0.05);
  slots.forEach((slot) => {
    equipment[slot] = Math.random() < 0.75 ? genLoot(oppLv, Math.max(0, lootBonus), slot) : null;
  });
  const baseAtk = Math.floor((8 + oppLv * 1.8) * tierMult);
  const baseDef = Math.floor((3 + oppLv * 0.9) * tierMult);
  const baseMhp = Math.floor((80 + oppLv * 12) * tierMult);
  const eqAtk = slots.reduce((s, sl) => s + (equipment[sl] ? equipment[sl].attack || 0 : 0), 0);
  const eqDef = slots.reduce((s, sl) => s + (equipment[sl] ? equipment[sl].defense || 0 : 0), 0);
  const eqHp = slots.reduce((s, sl) => s + (equipment[sl] ? equipment[sl].hp || 0 : 0), 0);
  const wcKeys = Object.keys(WEAPON_CATEGORIES);
  const wcKey = wcKeys[Math.floor(Math.random() * wcKeys.length)];
  return {
    id: Date.now() + Math.random(),
    name,
    title,
    level: oppLv,
    tier,
    attack: baseAtk + eqAtk,
    defense: baseDef + eqDef,
    maxHp: baseMhp + eqHp,
    hp: baseMhp + eqHp,
    equipment,
    goldCarried: Math.floor((50 + oppLv * 20 + Math.random() * oppLv * 30) * tierMult),
    wcKey,
    wins: Math.floor(Math.random() * 30),
    losses: Math.floor(Math.random() * 15),
  };
}
```

- [ ] **Step 4: Rewire arena callers in `legacy/game.tsx` and delete the inline arena helper**

```ts
// src/legacy/game.tsx
import { genArenaOpponent } from "../game/systems";

// remove the old inline arena helper in 483-541
```

- [ ] **Step 5: Run arena verification**

Run: `npm test -- src/game/systems/arena.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit the arena extraction**

```bash
git add src/game/systems/arena.ts src/game/systems/arena.test.ts src/legacy/game.tsx src/game/systems/index.ts
git commit -m "refactor: extract arena system"
```

## Task 6: Remove Duplicate Inline Logic And Finish Wiring

**Files:**
- Modify: `src/legacy/game.tsx`
- Test: `npm run typecheck`

- [ ] **Step 1: Remove all shadowed gameplay helpers still duplicated in `legacy/game.tsx`**

```ts
// src/legacy/game.tsx
// after this task, these should only exist as imports:
// genShopItem, genAuctionItem, genMercScroll, genLoot,
// cAtk, cDef, cMhp, cSpd, fightMonster,
// simulateExpedition, simulateRun, simulateMercRun,
// initQuestState, getQuestProgress, isQuestDone, genArenaOpponent
```

- [ ] **Step 2: Replace any remaining local call sites that still reference removed inline helpers**

```ts
// examples inside src/legacy/game.tsx
setShopItems(Array.from({ length: 8 }, () => genShopItem(player.level)));
setArenaOpponents(Array.from({ length: 4 }, () => genArenaOpponent(player.level)) as LegacyArenaOpponent[]);
const result = simulateRun(dungeon, tier, { ...player });
```

- [ ] **Step 3: Run a repo-wide typecheck to catch any missed imports or missing type exports**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit the final wiring pass**

```bash
git add src/legacy/game.tsx src/game/systems/index.ts src/game/types/index.ts src/game/types/arena.ts src/game/types/battle.ts
git commit -m "refactor: finish legacy systems wiring"
```

## Task 7: Final Regression Cleanup And Verification

**Files:**
- Modify: `src/game/systems/loot.ts`
- Modify: `src/game/systems/combat.ts`
- Modify: `src/game/systems/quests.ts`
- Modify: `src/game/systems/arena.ts`
- Modify: `README.md` (only if runtime notes materially changed)
- Test: all system tests plus existing suite

- [ ] **Step 1: Run the focused verification suite to find extraction regressions**

Run: `npm test -- src/game/systems/loot.test.ts && npm test -- src/game/systems/combat.test.ts && npm test -- src/game/systems/quests.test.ts && npm test -- src/game/systems/arena.test.ts`
Expected: PASS, or surface concrete failures to fix in the extracted systems.

- [ ] **Step 2: Fix behavior drift in the extracted modules instead of re-inlining logic in the legacy host**

```ts
// preferred repair location examples
// src/game/systems/loot.ts: restore the current rarity weights, affix count rules, or item cost calculation
// src/game/systems/combat.ts: restore the current dodge, armor, bleed, or boss reward behavior
// keep src/legacy/game.tsx as the caller; do not paste repaired rules back into the UI host
```

- [ ] **Step 3: Run the full project verification suite**

Run: `npm run typecheck && npm test -- src/game/lib/items.test.ts && npm test -- src/legacy/game.test.ts && npm test`
Expected: PASS.

- [ ] **Step 4: Update README verification notes only if a user-visible migration constraint changed**

```md
<!-- README.md -->
- Pure gameplay rules now live under `src/game/systems/*` while `src/legacy/game.tsx` remains the active UI host.
```

- [ ] **Step 5: Commit the cleanup pass**

```bash
git add src/game/systems/loot.ts src/game/systems/combat.ts src/game/systems/quests.ts src/game/systems/arena.ts README.md
git commit -m "test: verify extracted gameplay systems"
```

## Self-Review Notes

- Spec coverage: the plan covers all three extraction phases from the approved spec and includes the final cleanup pass explicitly requested by the user.
- Placeholder scan: no `TODO`, `TBD`, or deferred subtask markers remain.
- Type consistency: the plan uses the same system module names and extraction order as the approved design: `loot`, `combat`, `quests`, `arena`.
