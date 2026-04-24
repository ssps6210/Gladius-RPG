# Phased Pure Systems Extraction Design

**Date:** 2026-04-23

## Goal

Extract the remaining pure gameplay logic from `src/legacy/game.tsx` into focused `src/game/systems/*` modules in three consecutive phases, while keeping `src/legacy/game.tsx` as the active UI orchestration host.

## Current Context

The project has already completed the first modularization wave:

- `src/game/types/*` exists and holds split runtime/domain types.
- `src/game/data/*` exists and holds extracted content tables.
- `src/game/constants/*` exists for startup and storage constants.
- `src/game/persistence/*` exists for save/load migration and storage access.
- `src/game/lib/*` exists for a small set of pure helpers.
- `src/App.tsx` still renders `src/legacy/game.tsx` directly.

That means the remaining architectural bottleneck is `src/legacy/game.tsx`, which still owns major gameplay rules, random generation, combat resolution, quest logic, arena generation, and UI rendering in one file.

## Scope Decision

This work should proceed as one coordinated initiative split into three sequential extraction phases:

1. Loot and item generation
2. Combat core
3. Quests and arena

The user explicitly chose to complete all three extraction phases first and defer regression fixing until a final cleanup pass.

## Non-Goals

This design does not include:

- React component extraction
- state-management redesign such as `useReducer`
- deletion of `src/legacy/game.tsx`
- broad type-tightening across the whole runtime
- UI redesign or CSS module extraction
- behavior rebalancing unless needed to resolve a regression during final cleanup

## Recommended Architecture

Add a dedicated systems layer under `src/game/systems/`.

Suggested structure:

```text
src/game/systems/
  loot.ts
  combat.ts
  quests.ts
  arena.ts
  index.ts
```

Add `random.ts` only if repeated random-selection helpers become shared by multiple systems during extraction. Do not create it preemptively.

### Boundary Rules

- `src/legacy/game.tsx` remains the active composition root.
- `src/game/systems/*` contains pure or mostly pure gameplay rules.
- Systems may depend on `src/game/data/*`, `src/game/constants/*`, `src/game/types/*`, and `src/game/lib/*`.
- Systems must not depend on React, JSX, hooks, or DOM APIs.
- Systems should preserve current object shapes where possible so `src/legacy/game.tsx` can switch imports with minimal call-site churn.

## Phase 1: Loot And Item Generation

### Purpose

Move all item-generation and reward-generation logic out of `src/legacy/game.tsx` into `src/game/systems/loot.ts`.

### Included Logic

- `getRarity`
- `itemLevelScale`
- `rollRarity`
- `rollAffixes`
- `buildName`
- `genLoot`
- `genShopItem`
- `genAuctionItem`
- `genMercScroll`

### Dependencies

- `src/game/data/rarities.ts`
- `src/game/data/affixes.ts`
- `src/game/data/itemBases.ts`
- `src/game/data/mercenaries.ts`
- `src/game/lib/items.ts`

### Output Expectations

- Keep generated item objects compatible with existing legacy consumers.
- Preserve current item fields such as rarity metadata, affixes, specials, generated names, costs, and `uid` values.
- Avoid inventing new DTOs in this phase.

### Phase-Complete Condition

After this phase, `src/legacy/game.tsx` no longer owns core loot or item-generation algorithms. It only calls imported functions from `src/game/systems/loot.ts`.

## Phase 2: Combat Core

### Purpose

Move the combat math and battle simulation flow out of `src/legacy/game.tsx` into `src/game/systems/combat.ts`.

### Included Logic

- `sumEq`
- `cAtk`
- `cDef`
- `cMhp`
- `cSpd`
- `gSpec`
- `getWeaponCat`
- `applySpec`
- `applyWeaponTrait`
- `buildEnemy`
- `applyMonsterTrait`
- `enemyAttackPlayer`
- `fightMonster`
- any pure simulation wrappers such as expedition, dungeon, or mercenary-run simulation if they remain logic-only and do not require React state access

### Dependencies

- `src/game/data/monsters.ts`
- `src/game/data/weaponCategories.ts`
- runtime player and item types
- loot generation only where combat resolution already depends on it

### Output Expectations

- Return battle results in a stable object format that legacy callers can consume directly.
- Keep battle-log generation in the system layer rather than rebuilding combat text in the UI layer.
- Preserve current behavior before attempting cleanup or simplification.

### Phase-Complete Condition

After this phase, `src/legacy/game.tsx` no longer contains the combat formulas or round-resolution engine. It only triggers combat-system functions and applies returned state updates.

## Phase 3: Quests And Arena

### Purpose

Move quest progress logic and arena-rule generation out of `src/legacy/game.tsx` into `src/game/systems/quests.ts` and `src/game/systems/arena.ts`.

### Included Logic

Quest logic:

- `initQuestState`
- `getWeekKey`
- `getQuestProgress`
- `isQuestDone`

Arena logic:

- `genArenaOpponent`
- any pure arena reward, refresh, or cooldown-rule helpers that do not require direct UI concerns

### Dependencies

- `src/game/data/quests.ts`
- `src/game/data/arena.ts`
- runtime player, quest, and arena types

### Output Expectations

- Quest modules return pure progress and completion results.
- Arena modules return pure opponent-generation and rule-calculation results.
- UI-facing text formatting stays in the legacy UI layer unless it is already inseparable from rule evaluation.

### Phase-Complete Condition

After this phase, `src/legacy/game.tsx` no longer owns quest progression or arena-opponent generation logic. `QuestTab` and `ArenaTab` may still remain in the legacy file, but they should consume extracted systems instead of embedding rule code.

## Legacy Host Role During This Initiative

Throughout all three phases, `src/legacy/game.tsx` remains responsible for:

- React state and hooks
- event orchestration
- tab routing and UI branching
- rendering leaf components and tab content
- bridging system outputs into state updates

This is intentional. The current initiative is a systems extraction, not a UI decomposition or app-state redesign.

## Extraction Strategy

### Preferred Approach

Use a domain-by-domain extraction sequence:

1. `loot.ts`
2. `combat.ts`
3. `quests.ts` and `arena.ts`

This is preferred over extracting common helpers first or following runtime screens first, because it gives each system a clear ownership boundary and reduces the chance of mixing unrelated gameplay rules into one transitional module.

### Operational Rule

Each phase should prioritize moving existing logic with the smallest safe edits:

- move code before redesigning code
- preserve current shapes before introducing stronger abstractions
- keep call signatures close to the existing legacy usage where practical
- accept temporary bridge code if it reduces migration risk

## Final Cleanup Phase

After all three extraction phases are complete, run a dedicated cleanup and regression pass before starting any UI or state-management refactor.

### Cleanup Goals

1. Remove duplicate or shadowed logic still left in `src/legacy/game.tsx`
2. Rewire any remaining inline calls to use `src/game/systems/*`
3. Fix behavior drift introduced during staged extraction
4. Add focused system-level tests
5. Confirm `src/legacy/game.tsx` has effectively become a UI orchestration host rather than a gameplay-rules file

### Regression Focus Areas

- loot values and rarity behavior
- shop, auction, and mercenary-scroll generation
- battle damage, trait triggers, and combat logs
- expedition, dungeon, and mercenary-run outcomes
- quest progress calculations
- arena opponent generation and related rule behavior

### Test Direction

Prefer new system-level test files rather than relying only on the legacy runtime test:

- `src/game/systems/loot.test.ts`
- `src/game/systems/combat.test.ts`
- `src/game/systems/quests.test.ts`
- `src/game/systems/arena.test.ts`

Legacy tests can still remain for smoke coverage, but extracted systems should become the primary verification surface.

## Success Criteria

This initiative is successful when all of the following are true:

- the three domain phases have been completed in order
- loot, combat, quest, and arena rules live under `src/game/systems/*`
- `src/legacy/game.tsx` no longer contains the extracted rule implementations
- the runtime still uses `src/legacy/game.tsx` as the UI host
- regressions introduced by phased extraction have been fixed in the final cleanup pass
- system-level tests exist for the extracted domains

## Follow-On Work After This Initiative

Once the systems layer is stable, the next likely refactor can target one of these areas:

1. extract leaf UI components from `src/legacy/game.tsx`
2. split feature tabs into `src/features/*`
3. reorganize top-level state into a reducer-based structure

Those should be treated as separate design and planning efforts, not folded into this extraction initiative.
