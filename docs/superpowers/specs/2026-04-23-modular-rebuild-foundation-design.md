# Gladius-RPG Modular Rebuild Foundation Design

**Date:** 2026-04-23

## Goal

Start the post-migration modular rebuild by extracting the most stable, reusable, low-risk parts of the current runtime out of `src/legacy/game.tsx` while keeping the game continuously runnable.

This first modularization wave focuses on `game data + types`, with a small amount of low-risk pure helper extraction where it directly supports those boundaries.

## Context

- The `2026-04-23-minimal-runnable-migration` plan is complete.
- The current playable Parcel runtime is centered on `src/legacy/game.tsx`.
- `src/App.tsx`, `src/main.tsx`, `src/game/constants.ts`, `src/game/types.ts`, and `src/game/persistence.ts` already establish the initial migration shell.
- The core maintainability problem is now concentrated in `src/legacy/game.tsx`, which still mixes static data, implicit runtime shapes, helper functions, state orchestration, combat logic, persistence usage, and UI rendering.

## Source Of Truth

- `index.html` remains the historical behavior reference.
- `src/legacy/game.tsx` is the active runtime truth for the migrated application.
- The modular rebuild should preserve behavior observed in the current migrated runtime unless a separate design explicitly calls for behavior changes.

## First-Batch Scope

This design covers the first modularization batch only.

Included:

- Split runtime types into focused files under `src/game/types/`
- Extract static data/config tables from `src/legacy/game.tsx` into `src/game/data/`
- Extract a small set of low-risk, no-side-effect helper functions into `src/game/lib/`
- Keep `src/legacy/game.tsx` as the orchestration layer that imports and uses those modules

Excluded:

- Large-scale extraction of combat systems such as `fightMonster(...)`
- Large-scale extraction of activity simulation such as `simulateRun(...)`, `simulateExpedition(...)`, or mercenary run systems
- UI component modularization such as `ItemCard`, `HpBar`, `ReplayLog`, or tab-level feature files
- State management redesign
- Save format redesign
- Balance changes, content tuning, or unrelated bug-fixing work

## Success Criteria

The first modular rebuild batch is successful when all of the following are true:

- The app remains runnable after each extraction batch.
- `src/legacy/game.tsx` loses a meaningful amount of static declarations and local type clutter.
- `src/game/types/` becomes the canonical source for runtime object shapes used outside the legacy file.
- `src/game/data/` becomes the canonical source for extracted static game tables.
- The game can still load existing saves and complete basic gameplay flow.
- The resulting boundaries make later extraction of combat, loot, progression, quest, and arena systems materially easier.

## Recommended Strategy

Use a `definitions first, orchestration later` strategy.

The purpose of this batch is not to immediately shrink `src/legacy/game.tsx` into a clean final architecture. The purpose is to remove the most stable definitions from the runtime monolith so later extractions can operate against reusable modules rather than re-discovering constants and shapes inside a single 3000+ line file.

This is preferred over logic-first or feature-first splitting because the current runtime still has high coupling between data shapes, helper functions, top-level state, and render branches. Moving static data and explicit types first lowers the cost and risk of every later refactor.

## Approaches Considered

### Approach 1: Data-First Modularization

Extract types and static tables first, then gradually move low-risk helper functions.

Pros:

- Lowest regression risk
- Keeps the app continuously runnable
- Creates stable import boundaries for later logic extraction
- Works well with the current migrated runtime shape

Cons:

- Does not immediately produce the largest line-count reduction in `src/legacy/game.tsx`
- Some `any`-based transitional typing will remain for a while

### Approach 2: Logic-First Modularization

Start by extracting combat, loot, progression, and economy systems.

Pros:

- High long-term payoff once complete
- Better testability of important gameplay rules

Cons:

- Higher risk because the logic still depends on implicit data tables and object shapes
- More likely to introduce subtle behavior drift during extraction

### Approach 3: Feature-First Modularization

Split the runtime by visible features such as Expedition, Dungeon, Shop, Inventory, Quest, and Arena.

Pros:

- Fastest path to a visibly modular directory structure
- Easy to reason about from a UI perspective

Cons:

- Shared data and logic dependencies are still too entangled
- Risks creating shallow file splits without real domain boundaries

### Recommendation

Choose Approach 1.

It best matches the project's current state and the explicit requirement to keep the game runnable throughout the rebuild. It also creates the cleanest foundation for the next modularization phase.

## Target Structure For This Batch

```text
src/
  App.tsx
  main.tsx

  legacy/
    game.tsx

  game/
    constants/
      storage.ts
      ui.ts
    types/
      shared.ts
      item.ts
      player.ts
      battle.ts
      quest.ts
      arena.ts
      save.ts
    data/
      equipmentSlots.ts
      weaponCategories.ts
      enhanceLevels.ts
      trainStats.ts
      itemBases.ts
      rarities.ts
      affixes.ts
      monsters.ts
      expeditions.ts
      dungeons.ts
      quests.ts
      arena.ts
      mercenaries.ts
    lib/
      equipment.ts
      items.ts
      numbers.ts
      display.ts
    persistence/
      index.ts

  styles/
    globals.css
    tokens.css
```

## Module Responsibilities

### `src/game/types/`

- Holds explicit runtime-facing TypeScript types
- Splits the current single `src/game/types.ts` file into domain-focused files
- Must not contain React code or static data tables
- Should be the source of truth for shared shapes used by extracted modules

Initial responsibility split:

- `shared.ts` for cross-cutting primitives and small shared aliases
- `item.ts` for equipment, affixes, specials, and inventory-facing item shapes
- `player.ts` for player and equipment structures
- `battle.ts` for battle log and replay structures
- `quest.ts` for quest state and progress entries
- `arena.ts` for arena opponent and arena state structures
- `save.ts` for persistence payload shapes

### `src/game/data/`

- Holds static tables and content definitions only
- Must be framework-independent and side-effect-free
- Should not read browser APIs or mutate runtime state

Priority files in this batch:

- `equipmentSlots.ts`
- `weaponCategories.ts`
- `enhanceLevels.ts`
- `trainStats.ts`
- `itemBases.ts`

Second-wave files within the same batch if the first set lands cleanly:

- `rarities.ts`
- `affixes.ts`
- `monsters.ts`
- `expeditions.ts`
- `dungeons.ts`
- `quests.ts`
- `arena.ts`
- `mercenaries.ts`

### `src/game/lib/`

- Holds no-side-effect helper functions only
- Must not use React hooks, component state, or `localStorage`
- Exists to support extracted data/type modules and remove obvious utility clutter from the legacy runtime

Allowed examples in this batch:

- price calculation helpers
- enhancement stat application helpers
- numeric clamp/format helpers
- display mapping helpers such as slot or training-stat display lookups

Explicitly not included in this batch:

- the full combat loop
- dungeon/expedition simulation
- quest progression orchestration
- arena encounter orchestration

### `src/game/constants/`

- Holds stable cross-cutting constants only
- Should stay intentionally small
- Must not become a new monolithic dump for all data tables

Expected use in this batch:

- storage keys
- small shared display constants if needed across multiple modules

### `src/game/persistence/`

- Preserves the existing persistence boundary established during the migration phase
- Continues to isolate `localStorage` access from runtime rendering and extracted data/types
- Should not absorb unrelated runtime logic

### `src/legacy/game.tsx`

- Remains the active orchestration layer for now
- Continues to hold top-level state and render flow in this batch
- Gradually changes from defining static content locally to importing it from `src/game/*`
- May retain transitional `any`-based compatibility in the short term, but new extracted modules should stay cleaner than the legacy host file

## Extraction Order

### Step 1: Split `types`

Start by splitting `src/game/types.ts` into domain-focused files.

Rules:

- Preserve existing public shapes first
- Do not chase perfect typing in the same pass
- Localize broad transitional types instead of spreading them across the new modules

Acceptance criteria:

- The runtime still compiles
- `src/legacy/game.tsx` imports types from the new domain files
- No runtime behavior changes are introduced by the type split alone

### Step 2: Extract Lowest-Risk Static Tables

Extract the most obvious, stable declarations from `src/legacy/game.tsx` first:

- equipment slots
- weapon categories
- enhance levels
- train stats
- base item pools

Acceptance criteria:

- Local inline declarations are removed from `src/legacy/game.tsx`
- The runtime imports these tables from `src/game/data/`
- The app still starts and basic equipment/shop/train/enhance flows still work

### Step 3: Extract Medium-Risk Static Tables

After the first data group lands cleanly, extract the larger configuration sets:

- rarities
- affixes
- monsters
- expeditions
- dungeons
- quests
- arena definitions
- mercenary definitions

Acceptance criteria:

- Main tabs still open
- The game can trigger representative interactions that depend on the extracted tables
- No `undefined` configuration failures appear during basic play checks

### Step 4: Extract Small Pure Helpers

Only after data and types are stable, move the smallest independent utility functions into `src/game/lib/`.

Candidate examples:

- item sell-price calculation
- enhancement stat application
- display-key mapping helpers
- small numeric helpers used by multiple sites

Acceptance criteria:

- Each extracted helper is callable without React or browser state
- Existing behavior remains unchanged
- New helper modules gain targeted unit tests where practical

## Keep-The-Game-Running Rule

The user explicitly chose a continuously runnable approach.

That means:

- Every extraction batch must leave the app startable
- Every extraction batch must leave save loading intact
- Refactors should be small enough that failures are attributable to one boundary move, not a broad rewrite
- A cleaner structure is not success if the runtime becomes unstable halfway through

## Risk Controls

### 1. Avoid Mixed-Purpose Refactors

Do not combine these in one change set unless unavoidable:

- data extraction
- logic behavior changes
- UI rewriting
- text/content edits
- balancing changes

Each extraction should primarily be a boundary move.

### 2. Preserve Compatibility When Shapes Drift

If extracting a table exposes inconsistent shapes, preserve compatibility first. Do not use the first modularization batch to aggressively normalize all runtime data unless that normalization is required to keep the app working.

### 3. Keep Transitional Complexity In The Legacy Host

If some uncertainty remains, keep it in `src/legacy/game.tsx` rather than exporting messy abstractions into the new module structure. The new boundaries should be cleaner than the old host file.

### 4. Use Current Runtime Behavior As The Safety Rail

`src/legacy/game.tsx` is the current execution truth. If an extracted module causes different behavior from the active runtime, treat that as a regression unless a separate approved design says otherwise.

## Verification Strategy

Each extraction batch should be verified with the same layered checks.

### Static Verification

Run:

- `npm run typecheck`

Purpose:

- Catch import breakage
- Catch obvious type drift after splits

### Basic Runtime Verification

Run the app in development and verify:

- the app mounts
- the main UI appears
- no immediate white-screen or fatal boot error occurs

### Minimum Smoke Verification

After each batch, verify at least:

- load into the game
- open character/inventory/shop-related UI
- trigger one battle or expedition-related action
- refresh and confirm save restoration still works

### Targeted Regression Verification

When a specific data group moves, run a focused check tied to that group.

Examples:

- `itemBases` extraction: shop inventory, drops, equipment display
- `quests` extraction: quest list, progress display
- `arena` extraction: opponent generation and arena entry
- pure helper extraction: direct unit tests for the helper modules

## Testing Strategy

This batch should use a restrained testing approach.

- Continue using runtime smoke checks as the primary safety mechanism
- Add unit tests for newly extracted pure helpers where practical
- Keep persistence tests in place and extend them only if module moves affect persistence-facing types
- Do not block the first batch on broad end-to-end test infrastructure

The right time to expand automated coverage is when the project begins extracting larger pure systems such as combat, loot, progression, and quest evaluation.

## Out-Of-Scope Follow-Up Work

This design intentionally sets up, but does not implement, later phases such as:

- extracting combat and simulation systems
- extracting reusable UI components
- splitting tab-level feature modules
- introducing a more structured top-level state organization
- cleaning up or archiving historical legacy snapshots

Those should be handled by later specs and plans, using the boundaries created here.

## Final Recommendation

Proceed with a first-batch modular rebuild that extracts the most stable definition-layer code out of `src/legacy/game.tsx` into `src/game/types/`, `src/game/data/`, and a narrowly scoped `src/game/lib/`, while preserving the current runtime as a continuously runnable orchestration layer.

This yields the best balance of safety, clarity, and forward progress. It avoids the false efficiency of feature-folder reshuffles or early combat extraction before the underlying data and shape boundaries are stable.
