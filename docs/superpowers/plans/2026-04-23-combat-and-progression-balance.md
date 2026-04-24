# Gladius-RPG Combat And Progression Balance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the modular combat and progression layers with the final upstream behavior so downstream recovery, tavern, and mercenary systems can depend on structured results.

**Architecture:** Introduce structured combat/progression result types first, then port the final upstream level-up and speed-driven battle semantics into `src/game/systems/combat.ts` and `src/game/systems/progression.ts`. Keep formulas faithful to upstream and expose downstream-ready result data.

**Tech Stack:** TypeScript, Vitest, React 19

---

## File Structure

### Files to create

- `src/game/types/combat.ts` — combat result and kill record types if not already created by the overview plan
- `src/game/systems/combat.test.ts` — combat parity tests for level-up and speed semantics
- `src/game/systems/progression.test.ts` — progression parity tests

### Files to modify

- `src/game/systems/combat.ts`
- `src/game/systems/progression.ts`

### Files to use as source material

- `docs/superpowers/specs/2026-04-23-combat-and-progression-balance-design.md`
- `upstream/main:index.html`

## Implementation Notes

- Copy formulas and evaluation order from final upstream behavior before considering extraction cleanup.
- Do not make tavern systems parse battle log strings.

### Task 1: Make Progression Return Upstream-Level Healing

**Files:**
- Test: `src/game/systems/progression.test.ts`
- Modify: `src/game/systems/progression.ts`

- [ ] **Step 1: Write the failing progression tests**

```ts
import { describe, expect, it } from "vitest";
import { applyProgressionRewards } from "./progression";

describe("applyProgressionRewards", () => {
  it("fully heals on level up", () => {
    const result = applyProgressionRewards(
      { level: 1, exp: 95, expNeeded: 100, hp: 12, maxHp: 100, highestLevel: 1 },
      { exp: 10, gold: 0 },
    );

    expect(result.player.level).toBe(2);
    expect(result.player.hp).toBe(result.player.maxHp);
  });

  it("updates highestLevel when leveling", () => {
    const result = applyProgressionRewards(
      { level: 2, exp: 95, expNeeded: 100, hp: 40, maxHp: 110, highestLevel: 2 },
      { exp: 20, gold: 0 },
    );

    expect(result.player.highestLevel).toBe(3);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/game/systems/progression.test.ts`
Expected: FAIL because progression still reflects pre-upstream parity or missing helper exports

- [ ] **Step 3: Implement the minimal progression fix**

```ts
export function applyProgressionRewards(player: PlayerLike, rewards: { exp: number; gold: number }) {
  const next = { ...player, exp: player.exp + rewards.exp };
  let leveled = false;

  while (next.exp >= next.expNeeded) {
    next.exp -= next.expNeeded;
    next.level += 1;
    next.expNeeded = getNextExpNeeded(next.level);
    next.maxHp = getLevelMaxHp(next.level, next.maxHp);
    leveled = true;
  }

  next.highestLevel = Math.max(next.highestLevel ?? next.level, next.level);
  if (leveled) next.hp = next.maxHp;

  return { player: next, leveled };
}
```

- [ ] **Step 4: Re-run the tests to verify they pass**

Run: `npx vitest run src/game/systems/progression.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/systems/progression.ts src/game/systems/progression.test.ts
git commit -m "Align progression rewards with upstream healing"
```

### Task 2: Make Combat Emit Structured Kill Records And Speed Semantics

**Files:**
- Test: `src/game/systems/combat.test.ts`
- Modify: `src/game/systems/combat.ts`

- [ ] **Step 1: Write the failing combat tests**

```ts
import { describe, expect, it } from "vitest";
import { runCombat } from "./combat";

describe("runCombat", () => {
  it("returns structured kill records", () => {
    const result = runCombat(mockFastPlayer(), mockWeakEnemy());

    expect(result.kills).toEqual([
      expect.objectContaining({ enemyId: "slime", count: 1 }),
    ]);
  });

  it("records speed-driven combat effects in result logs", () => {
    const result = runCombat(mockFastPlayer(), mockWeakEnemy());

    expect(result.log.some((entry) => entry.includes("速度"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/game/systems/combat.test.ts`
Expected: FAIL because `runCombat` does not yet expose the required structured result contract

- [ ] **Step 3: Implement the structured combat result shape**

```ts
return {
  outcome,
  kills: defeated ? [{ enemyId: enemy.id, enemyName: enemy.name, count: 1 }] : [],
  rewards: { exp: expGain, gold: goldGain, loot },
  log,
  player,
};
```

- [ ] **Step 4: Re-run the tests to verify they pass**

Run: `npx vitest run src/game/systems/combat.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/systems/combat.ts src/game/systems/combat.test.ts
git commit -m "Expose upstream-ready combat result contract"
```

## Self-Review

### Spec Coverage

- Level-up full heal: covered by Task 1
- Highest-level timing: covered by Task 1
- Structured kills and downstream-ready combat results: covered by Task 2

### Placeholder Scan

- No placeholder text remains.

### Type Consistency

- `applyProgressionRewards` and `runCombat` both emit downstream-ready result data expected by later plans.
