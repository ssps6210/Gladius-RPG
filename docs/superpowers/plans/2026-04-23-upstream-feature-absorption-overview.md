# Gladius-RPG Upstream Feature Absorption Overview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare the modular app to absorb all approved upstream-only gameplay and UI behavior with a dependency-safe execution sequence.

**Architecture:** Establish shared result contracts and feature module seams first, then land each upstream feature domain in the order defined by the overview spec. Keep the legacy runtime available only as verification reference while moving absorbed behavior into `src/game`, `src/features`, and `src/components`.

**Tech Stack:** React 19, TypeScript, Parcel, Vitest, localStorage persistence wrappers

---

## File Structure

### Files to create

- `src/game/types/combat.ts` — shared combat result, kill record, and reward payload shapes
- `src/game/types/recovery.ts` — injury and tavern recovery state
- `src/game/types/tavern.ts` — tavern board, active bounty, and story reward state
- `src/game/systems/recovery.ts` — injury and rest logic
- `src/game/systems/tavernQuests.ts` — tavern bounty rules
- `src/game/systems/mercenaryCombat.ts` — mercenary-only combat rules
- `src/features/tavern/` — tavern page shell and child panels
- `src/components/StoryModal/` — tavern story reward presentation

### Files to modify

- `src/game/systems/combat.ts` — expose structured kill and result output
- `src/game/systems/progression.ts` — align level-up and downstream result contract
- `src/game/systems/economy.ts` — add sell-threshold helpers
- `src/App.tsx` or modular route shell — expose final feature surfaces
- persistence modules under `src/game/` — persist any new upstream-required state

### Files to use as source material

- `docs/superpowers/specs/2026-04-23-upstream-feature-absorption-overview-design.md`
- `docs/superpowers/specs/2026-04-23-combat-and-progression-balance-design.md`
- `docs/superpowers/specs/2026-04-23-tavern-and-recovery-design.md`
- `docs/superpowers/specs/2026-04-23-tavern-bounties-and-story-rewards-design.md`
- `docs/superpowers/specs/2026-04-23-shop-sell-thresholds-design.md`
- `docs/superpowers/specs/2026-04-23-mercenary-dungeon-balance-design.md`
- `docs/superpowers/specs/2026-04-23-upstream-ui-text-and-footer-design.md`
- `upstream/main:index.html`

## Implementation Notes

- Implementation order:
  1. `2026-04-23-combat-and-progression-balance.md`
  2. `2026-04-23-tavern-and-recovery.md`
  3. `2026-04-23-tavern-bounties-and-story-rewards.md`
  4. `2026-04-23-shop-sell-thresholds.md`
  5. `2026-04-23-mercenary-dungeon-balance.md`
  6. `2026-04-23-upstream-ui-text-and-footer.md`
- Implement the six feature-domain plans in the order listed here.
- Do not start tavern bounty work until combat results expose structured kill data.
- Keep save compatibility explicit when adding recovery or tavern quest persistence.
- Preserve the final upstream behavior over any older migrated-runtime behavior.

### Task 1: Establish Shared Type Contracts

**Files:**
- Create: `src/game/types/combat.ts`
- Create: `src/game/types/recovery.ts`
- Create: `src/game/types/tavern.ts`

- [ ] **Step 1: Write the failing type-driven tests**

```ts
import { describe, expectTypeOf, it } from "vitest";
import type { CombatResult, KillRecord } from "../types/combat";
import type { RecoveryState } from "../types/recovery";
import type { StoryRewardState, TavernQuestState } from "../types/tavern";

describe("upstream absorption shared types", () => {
  it("exposes combat result records for downstream systems", () => {
    expectTypeOf<CombatResult>().toMatchTypeOf<{
      outcome: "win" | "loss" | "draw";
      kills: KillRecord[];
      rewards: { exp: number; gold: number };
    }>();
  });

  it("exposes independent recovery timestamps", () => {
    expectTypeOf<RecoveryState>().toMatchTypeOf<{
      dungeonInjuredUntil: number;
      arenaInjuredUntil: number;
    }>();
  });

  it("exposes tavern quest and story reward state", () => {
    expectTypeOf<TavernQuestState>().toMatchTypeOf<object>();
    expectTypeOf<StoryRewardState | null>().toMatchTypeOf<object | null>();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/game/types/upstream-absorption-types.test.ts`
Expected: FAIL because the new shared type modules do not exist yet

- [ ] **Step 3: Write the minimal shared types**

```ts
export interface KillRecord {
  enemyId: string;
  enemyName: string;
  enemyCategory?: string;
  count: number;
}

export interface CombatResult {
  outcome: "win" | "loss" | "draw";
  kills: KillRecord[];
  rewards: {
    exp: number;
    gold: number;
    loot: unknown[];
  };
}
```

```ts
export interface RecoveryState {
  dungeonInjuredUntil: number;
  arenaInjuredUntil: number;
}
```

```ts
export interface StoryRewardState {
  title: string;
  icon: string;
  conclusion: string;
  reward: { gold: number; exp: number };
}

export interface TavernQuestState {
  board: unknown[];
  activeQuestId: string | null;
  progress: Record<string, number>;
  storyReward: StoryRewardState | null;
}
```

- [ ] **Step 4: Re-run the test to verify it passes**

Run: `npx vitest run src/game/types/upstream-absorption-types.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/types/combat.ts src/game/types/recovery.ts src/game/types/tavern.ts src/game/types/upstream-absorption-types.test.ts
git commit -m "Define shared types for upstream feature absorption"
```

### Task 2: Verify The Feature Plan Sequence

**Files:**
- Modify: `docs/superpowers/plans/2026-04-23-upstream-feature-absorption-overview.md`

- [ ] **Step 1: Verify the implementation order block is present**

```md
Implementation order:
1. `2026-04-23-combat-and-progression-balance.md`
2. `2026-04-23-tavern-and-recovery.md`
3. `2026-04-23-tavern-bounties-and-story-rewards.md`
4. `2026-04-23-shop-sell-thresholds.md`
5. `2026-04-23-mercenary-dungeon-balance.md`
6. `2026-04-23-upstream-ui-text-and-footer.md`
```

- [ ] **Step 2: Verify the plan still reflects the approved design**

Run: `grep -n "Implementation order" docs/superpowers/plans/2026-04-23-upstream-feature-absorption-overview.md`
Expected: one matching line showing the final dependency order

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/plans/2026-04-23-upstream-feature-absorption-overview.md
git commit -m "Document upstream absorption execution order"
```

## Self-Review

### Spec Coverage

- Shared combat/recovery/tavern contracts: covered by Task 1
- Approved dependency order across the six feature plans: covered by Task 2

No uncovered overview requirement remains for this coordination plan.

### Placeholder Scan

- No placeholder text remains.
- All future implementation work is delegated to concrete feature plans.

### Type Consistency

- Shared type names are consistent with the approved specs: `CombatResult`, `RecoveryState`, `TavernQuestState`, `StoryRewardState`
