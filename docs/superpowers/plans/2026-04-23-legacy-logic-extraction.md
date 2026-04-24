# Legacy Logic Extraction — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the four remaining inline logic pieces out of `src/legacy/game.tsx` into their proper modular homes, leaving the legacy file as a pure UI orchestration host.

**Architecture:** Four independent extractions, each committed separately. No new systems are introduced — only code that already exists inline is moved. The legacy file's public behavior is preserved; the only intentional semantic change is `lvUp` adopting the upstream full-heal-on-level behavior (already canonical in `progression.ts`).

**Tech Stack:** TypeScript 5, Vitest 3, React 19

---

## File Structure

### Files to create

- `src/game/data/dungeonTiers.ts` — `DUNGEON_TIERS` constant moved from `src/legacy/game.tsx:105-109`

### Files to modify

- `src/legacy/game.tsx` — four targeted edits (import + delete inline definition) for each extraction
- `src/game/systems/combat.ts` — add `simulateArenaBattle` export
- `src/game/systems/combat.test.ts` — add `simulateArenaBattle` test
- `src/game/systems/quests.ts` — add `checkQuestReset` export
- `src/game/systems/quests.test.ts` — add `checkQuestReset` test

---

## Task 1: Extract `DUNGEON_TIERS` to a Data Module

**Files:**
- Create: `src/game/data/dungeonTiers.ts`
- Modify: `src/legacy/game.tsx:105-109`
- Test: `npm run typecheck`

- [ ] **Step 1: Create the data file**

```ts
// src/game/data/dungeonTiers.ts
export const DUNGEON_TIERS = [
  { id: "normal", label: "普通", color: "#8a9070", mult: 1.0,  expMult: 1.0, goldMult: 1.0, lootBonus: 0,    minLvOffset: 0 },
  { id: "hero",   label: "英雄", color: "#4a9fd4", mult: 1.35, expMult: 1.6, goldMult: 1.4, lootBonus: 0.15, minLvOffset: 4 },
  { id: "legend", label: "傳說", color: "#d4b84a", mult: 1.75, expMult: 2.5, goldMult: 2.0, lootBonus: 0.28, minLvOffset: 8 },
];
```

- [ ] **Step 2: Replace the inline definition in `legacy/game.tsx`**

Delete lines 105-109 in `src/legacy/game.tsx`:
```ts
const DUNGEON_TIERS: AnyList = [
  { id:"normal", label:"普通", color:"#8a9070", mult:1.0,  expMult:1.0, goldMult:1.0, lootBonus:0,    minLvOffset:0 },
  { id:"hero",   label:"英雄", color:"#4a9fd4", mult:1.35, expMult:1.6, goldMult:1.4, lootBonus:0.15, minLvOffset:4 },
  { id:"legend", label:"傳說", color:"#d4b84a", mult:1.75, expMult:2.5, goldMult:2.0, lootBonus:0.28, minLvOffset:8 },
];
```

Replace with import at the top of the file (add to the existing import block):
```ts
import { DUNGEON_TIERS } from "../game/data/dungeonTiers";
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS (no errors)

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add src/game/data/dungeonTiers.ts src/legacy/game.tsx
git commit -m "refactor: extract DUNGEON_TIERS to data module"
```

---

## Task 2: Wire `lvUp` to Use `applyProgressionRewards`

**Files:**
- Modify: `src/legacy/game.tsx:1259-1266`
- Test: `npm test -- src/legacy/game.test.ts`

The legacy `lvUp` only adds 20 HP on level-up. `applyProgressionRewards` (already in `src/game/systems/progression.ts`) does a full heal — this is the intentional upstream fix. This task replaces the body of `lvUp` with a thin wrapper so downstream callers (`simulateRun`, `simulateExpedition`, `simulateMercRun`) continue working unchanged.

- [ ] **Step 1: Add `applyProgressionRewards` to the existing import from `"../game/systems"`**

In `src/legacy/game.tsx`, find the import block at lines 20–41 and add `applyProgressionRewards`:

```ts
import {
  applyProgressionRewards,
  cAtk,
  // ... (rest unchanged)
} from "../game/systems";
```

- [ ] **Step 2: Replace the body of `lvUp` (lines 1259-1266)**

Delete the current implementation:
```ts
  function lvUp(np: any,expG: any,goldG: any,log: any){
    np.gold+=goldG;
    let exp=np.exp+expG,lv=np.level,en=np.expNeeded,mhp=np.maxHp;
    while(exp>=en){exp-=en;lv++;en=Math.floor(en*1.4);mhp+=15;np.attack+=2;np.defense+=1;log.push({txt:`🌟 等級提升！Lv.${lv}！`,type:"win"});}
    np.exp=exp;np.expNeeded=en;np.level=lv;np.maxHp=mhp;
    np.hp=Math.min(np.hp+20,cMhp(np));
    return np;
  }
```

Replace with:
```ts
  function lvUp(np: any, expG: any, goldG: any, log: any) {
    const withGold = { ...np, gold: (np.gold || 0) + goldG };
    const prevLevel = withGold.level;
    const { player: next } = applyProgressionRewards(withGold, { exp: expG, gold: 0 });
    for (let lv = prevLevel + 1; lv <= next.level; lv++) {
      log.push({ txt: `🌟 等級提升！Lv.${lv}！`, type: "win" });
    }
    return next;
  }
```

- [ ] **Step 3: Run the tests**

Run: `npm test`
Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add src/legacy/game.tsx
git commit -m "refactor: wire legacy lvUp to applyProgressionRewards"
```

---

## Task 3: Extract `simulateArenaBattle` to `combat.ts`

**Files:**
- Modify: `src/game/systems/combat.ts`
- Modify: `src/game/systems/combat.test.ts`
- Modify: `src/legacy/game.tsx:1269-1317`
- Test: `npm test -- src/game/systems/combat.test.ts`

`simulateArenaBattle` is a pure function — it only depends on helpers already exported from `combat.ts`. It can be moved directly.

- [ ] **Step 1: Write the failing test**

Add to `src/game/systems/combat.test.ts` (at the end, before the last `});`):

```ts
describe("simulateArenaBattle", () => {
  it("returns a win result with gold plundered when player is stronger", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const player = createPlayer({ attack: 100, defense: 50, hp: 500, maxHp: 500, trainedAtk: 0, trainedDef: 0, trainedHp: 0, trainedSpd: 0 });
    const opponent = {
      name: "弱雞", level: 1, tier: "weak",
      attack: 1, defense: 0, maxHp: 5, hp: 5,
      goldCarried: 200, wcKey: null,
    };
    const result = simulateArenaBattle(player, opponent);
    expect(result.won).toBe(true);
    expect(result.goldPlundered).toBeGreaterThan(0);
    expect(result.log.length).toBeGreaterThan(0);
  });

  it("returns a loss result when player is weaker", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const player = createPlayer({ attack: 1, defense: 0, hp: 5, maxHp: 5, trainedAtk: 0, trainedDef: 0, trainedHp: 0, trainedSpd: 0 });
    const opponent = {
      name: "強敵", level: 50, tier: "strong",
      attack: 999, defense: 500, maxHp: 9999, hp: 9999,
      goldCarried: 500, wcKey: null,
    };
    const result = simulateArenaBattle(player, opponent);
    expect(result.won).toBe(false);
    expect(result.goldPlundered).toBe(0);
  });
});
```

Also add `simulateArenaBattle` to the import at the top of `combat.test.ts`:
```ts
import {
  // ... existing imports ...
  simulateArenaBattle,
} from "./combat";
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/game/systems/combat.test.ts`
Expected: FAIL — `simulateArenaBattle` is not exported from `./combat`

- [ ] **Step 3: Add `simulateArenaBattle` to `src/game/systems/combat.ts`**

Append after the last export in `combat.ts`:

```ts
export function simulateArenaBattle(player: any, opponent: any) {
  const pAtk = cAtk(player);
  const pDef = cDef(player);
  const pMhp = cMhp(player);
  const pSpd = cSpd(player);
  const specials = gSpec(player);
  const wc = getWeaponCat(player);
  const oWc = opponent.wcKey ? WEAPON_CATEGORIES[opponent.wcKey] : null;
  const oSpd = Math.floor((3 + opponent.level * 0.5) * (opponent.tier === "strong" ? 1.2 : 1));
  const log: any[] = [];
  const bleedRef = { val: 0 };

  log.push({ txt: `⚔️ 競技場對決！`, type: "title" });
  log.push({ txt: `你 (Lv.${player.level} 攻${pAtk} 防${pDef}) vs ${opponent.name} (Lv.${opponent.level} 攻${opponent.attack} 防${opponent.defense})`, type: "info" });
  if (wc)  log.push({ txt: `你的武器：${wc.label} — ${wc.traitDesc}`, type: "info" });
  if (oWc) log.push({ txt: `對手武器：${oWc.label} — ${oWc.traitDesc}`, type: "info" });
  log.push({ txt: `━━━━━━━━━━━━━━━━━━`, type: "sep" });

  if (pSpd >= oSpd || (wc && wc.trait === "firstblood")) {
    log.push({ txt: `⚡ 你先手！（速度 ${pSpd} vs ${oSpd}）`, type: "hit" });
  } else {
    log.push({ txt: `⚡ 對手先手！（速度 ${oSpd} vs ${pSpd}）`, type: "enemy" });
  }

  const fakeEnemy = {
    name: opponent.name, icon: "🏟",
    hp: opponent.maxHp, maxHp: opponent.maxHp,
    attack: opponent.attack, defense: opponent.defense,
    trait: oWc ? oWc.trait : "balanced", traitDesc: oWc ? oWc.traitDesc : "",
    isBoss: false, burnStacks: 0, shielded: false, regenVal: 0,
    expReward: 0, goldReward: 0,
  };

  const result = fightMonster(fakeEnemy, { ...player }, pAtk, pDef, pMhp, specials, wc, log, bleedRef);
  const won = result.won;
  let goldPlundered = 0;

  if (won) {
    goldPlundered = Math.floor(opponent.goldCarried * (0.10 + Math.random() * 0.15));
    log.push({ txt: `━━━━━━━━━━━━━━━━━━`, type: "sep" });
    log.push({ txt: `🏆 勝利！擊敗 ${opponent.name}！`, type: "win" });
    log.push({ txt: `💰 掠奪金幣 ${goldPlundered}（對手攜帶 ${opponent.goldCarried}）`, type: "win" });
  } else {
    log.push({ txt: `━━━━━━━━━━━━━━━━━━`, type: "sep" });
    log.push({ txt: `💀 落敗！被 ${opponent.name} 擊倒！`, type: "lose" });
    log.push({ txt: `🛌 你需要休息 30 分鐘才能再戰`, type: "lose" });
  }
  log.push({ txt: `─────────────────`, type: "sep" });
  log.push({ txt: `📊 造成 ${result.totalDmgDealt} · 承受 ${result.totalDmgTaken} · 爆擊 ${result.crits} 次`, type: "info" });

  return { log, finalPlayer: result.np, won, goldPlundered };
}
```

- [ ] **Step 4: Run the combat tests to verify they pass**

Run: `npm test -- src/game/systems/combat.test.ts`
Expected: PASS (all combat tests including the two new arena tests)

- [ ] **Step 5: Wire the import in `legacy/game.tsx` and delete the inline function**

Add `simulateArenaBattle` to the existing `"../game/systems"` import in `game.tsx`:
```ts
import {
  applyProgressionRewards,
  // ... existing ...
  simulateArenaBattle,
} from "../game/systems";
```

Delete the inline `simulateArenaBattle` function (lines 1268-1317 in game.tsx, starting with the comment `// ── Simulate Arena PvP ──`).

- [ ] **Step 6: Verify typecheck and full test suite**

Run: `npm run typecheck && npm test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/game/systems/combat.ts src/game/systems/combat.test.ts src/legacy/game.tsx
git commit -m "refactor: extract simulateArenaBattle to combat system"
```

---

## Task 4: Extract `checkQuestReset` to `quests.ts`

**Files:**
- Modify: `src/game/systems/quests.ts`
- Modify: `src/game/systems/quests.test.ts`
- Modify: `src/legacy/game.tsx:1556-1581`
- Test: `npm test -- src/game/systems/quests.test.ts`

`checkQuestReset` in the legacy component closes over `player`. The extraction makes `player` an explicit parameter.

- [ ] **Step 1: Write the failing test**

Add to `src/game/systems/quests.test.ts`:

```ts
describe("checkQuestReset", () => {
  it("resets daily quest bases when the date has changed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-24T00:00:00Z"));

    const oldState = {
      dailyDate: "2026-04-23",
      weeklyDate: "2026-W17",
      progress: { kill_daily: { collected: true, baseVal: 0 } },
    };
    const player = { totalKills: 10 };

    const newState = checkQuestReset(oldState, player);

    expect(newState.dailyDate).toBe("2026-04-24");
    expect(newState.progress.kill_daily.collected).toBe(false);

    vi.useRealTimers();
  });

  it("returns the same object reference when nothing has changed", () => {
    vi.useFakeTimers();
    const today = "2026-04-24";
    vi.setSystemTime(new Date(`${today}T00:00:00Z`));

    const state = {
      dailyDate: today,
      weeklyDate: getWeekKey(),
      progress: { kill_daily: { collected: false, baseVal: 0 } },
    };
    const player = { totalKills: 5 };

    const result = checkQuestReset(state, player);
    expect(result).toBe(state);

    vi.useRealTimers();
  });
});
```

Also add `checkQuestReset` to the import at the top of `quests.test.ts`:
```ts
import { checkQuestReset, getQuestProgress, getWeekKey, initQuestState, isQuestDone } from "./quests";
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/game/systems/quests.test.ts`
Expected: FAIL — `checkQuestReset` is not exported from `./quests`

- [ ] **Step 3: Add `checkQuestReset` to `src/game/systems/quests.ts`**

Append to the end of `quests.ts`:

```ts
export function checkQuestReset(questState: any, player: any): any {
  const today = new Date().toISOString().slice(0, 10);
  const week = getWeekKey();
  let newQs = { ...questState, progress: { ...questState.progress } };
  let changed = false;

  if (questState.dailyDate !== today) {
    Object.keys(QUEST_DEFS).forEach((id) => {
      if (QUEST_DEFS[id].cat === "daily") {
        newQs.progress[id] = { collected: false, baseVal: player[QUEST_DEFS[id].field] || 0 };
      }
    });
    newQs.dailyDate = today;
    changed = true;
  }

  if (questState.weeklyDate !== week) {
    Object.keys(QUEST_DEFS).forEach((id) => {
      if (QUEST_DEFS[id].cat === "weekly") {
        newQs.progress[id] = { collected: false, baseVal: player[QUEST_DEFS[id].field] || 0 };
      }
    });
    newQs.weeklyDate = week;
    changed = true;
  }

  return changed ? newQs : questState;
}
```

- [ ] **Step 4: Run the quest tests to verify they pass**

Run: `npm test -- src/game/systems/quests.test.ts`
Expected: PASS

- [ ] **Step 5: Wire the import in `legacy/game.tsx` and delete the inline function**

Add `checkQuestReset` to the existing `"../game/systems"` import in `game.tsx`:
```ts
import {
  applyProgressionRewards,
  checkQuestReset,
  // ... existing ...
} from "../game/systems";
```

In the `updateQuestProgress` function (around line 1615), replace:
```ts
const newQs = checkQuestReset(questState);
```
with:
```ts
const newQs = checkQuestReset(questState, updatedPlayer);
```

In the `collectQuest` function (around line 1590), if `checkQuestReset` is called there, also pass `player`:
```ts
// any calls to checkQuestReset(qs) → checkQuestReset(qs, player)
```

Delete the inline `checkQuestReset` function (lines 1556-1581):
```ts
  const checkQuestReset = (qs: any) => {
    ...
  };
```

- [ ] **Step 6: Verify typecheck and full test suite**

Run: `npm run typecheck && npm test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/game/systems/quests.ts src/game/systems/quests.test.ts src/legacy/game.tsx
git commit -m "refactor: extract checkQuestReset to quest system"
```

---

## Self-Review

### Spec Coverage

- `DUNGEON_TIERS` data extraction → Task 1 ✓
- `lvUp` wired to `applyProgressionRewards` → Task 2 ✓
- `simulateArenaBattle` moved to `combat.ts` → Task 3 ✓
- `checkQuestReset` moved to `quests.ts` → Task 4 ✓

### Placeholder Scan

No placeholders remain.

### Type Consistency

- `applyProgressionRewards` signature: `(player: PlayerLike, rewards: { exp: number; gold: number })` — Task 2 wrapper passes `{ exp: expG, gold: 0 }` and handles gold separately. ✓
- `simulateArenaBattle(player, opponent)` — same shape as the deleted inline function. ✓
- `checkQuestReset(questState, player)` — `player` added as explicit parameter; all call sites updated. ✓
