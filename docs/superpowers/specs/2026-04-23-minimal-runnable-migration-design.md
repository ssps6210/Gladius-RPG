# Gladius-RPG Minimal Runnable Migration Design

**Date:** 2026-04-23

## Goal

Move `Gladius-RPG` from the current `index.html` + React CDN + Babel Standalone runtime into a `Parcel + React 19 + TypeScript` application while preserving gameplay behavior and reaching near-feature parity with the current playable runtime.

This first migration is intentionally not a full architectural rewrite. It prioritizes a working, portable, near-complete build over immediate deep modularization.

## Baseline And Source Of Truth

- `index.html` is the runtime behavior reference and feature truth.
- `App.jsx` is a secondary extraction aid when code is easier to read there, but it must not override behavior observed in `index.html`.
- Historical snapshot files such as `App (1|2|3).jsx` and `gladiatus-clone (1|2|3).jsx` are out of scope for the first migration pass.

## Non-Goals For Phase 1

- No full rewrite of combat, economy, quest, or arena systems.
- No mandatory adoption of an external state library in the first pass.
- No broad visual redesign.
- No archival or deletion of legacy files before the new build is running with near-complete coverage.
- No save format breakage unless a compatibility layer is added first.

## Recommended Migration Strategy

Use a "whole-file port, then controlled extraction" strategy.

The first pass should port the existing monolithic runtime into a modern build pipeline with the smallest behavior-preserving edits possible. After the game is running in the new toolchain, extraction can proceed incrementally.

This is preferred over early deep refactoring because the current runtime contains tightly coupled systems, implicit data shapes, and multiple snapshot variants. Early decomposition would increase the chance of functional drift, especially in quests, arena, persistence, and item generation.

## Phase 1 Success Criteria

The migration is considered successful when all of the following are true:

- The app runs through `Parcel + React 19 + TypeScript`.
- The runtime no longer depends on browser-loaded React, ReactDOM, or Babel Standalone.
- The main gameplay loop is usable end-to-end.
- Existing save data under `localStorage` keys `g_pl` and `g_inv` can still be loaded.
- The migrated app is close in practical feature coverage to the current `index.html` runtime, including:
  - expeditions
  - dungeons
  - shop and auction behavior that currently exists
  - inventory and equipment flow
  - enhancement and training
  - quests
  - arena
  - battle log / replay / loot popup behavior
- The codebase gains a minimal but real module boundary for entrypoint, legacy runtime, types, constants, persistence, and global styles.

## Transitional Target Structure

The first migration phase should use a deliberately small transitional structure rather than the final ideal structure.

```text
/
  index.html
  package.json
  tsconfig.json
  src/
    main.tsx
    App.tsx
    legacy/
      game.tsx
    game/
      types.ts
      constants.ts
      persistence.ts
    styles/
      globals.css
      tokens.css
```

## Responsibilities By File

### `index.html`

- Minimal HTML shell only.
- Root mount node.
- No inline game logic.
- No CDN React or Babel references.

### `src/main.tsx`

- Imports global styles.
- Creates the React root.
- Renders `App`.

### `src/App.tsx`

- Lightweight application shell.
- Hosts the migrated runtime component.
- Keeps room for future providers or routing, but does not introduce them prematurely.

### `src/legacy/game.tsx`

- Main migration target for the large runtime code currently embedded in `index.html`.
- Allowed to remain large in phase 1.
- Should preserve behavior as directly as practical.
- Should import React from modules instead of relying on global `React`.

### `src/game/types.ts`

- Central home for the first pass of explicit TypeScript types.
- Starts as a compact file because the immediate goal is safer migration, not perfect domain decomposition.
- Must cover the most important runtime shapes first, including player, item, inventory item variants, replay/log shapes, quest state, and arena-related state that is required to compile safely.

### `src/game/constants.ts`

- Stable cross-cutting constants only.
- Includes storage keys and any low-risk shared constants that improve readability.
- Should not become a dumping ground for all game data in phase 1.

### `src/game/persistence.ts`

- Owns save/load behavior.
- Wraps access to `localStorage`.
- Provides save compatibility and migration helpers.
- Keeps storage logic out of rendering code.

### `src/styles/tokens.css`

- Theme variables only.
- Early tokens should focus on colors, spacing, radii, and fonts already present in the game.

### `src/styles/globals.css`

- Reset and document-level styles.
- Body background, font setup, root sizing, and loading-shell related styles.
- No attempt to convert all current styles to modular CSS in the first pass.

## State Design For Phase 1

The first migration should keep the current top-level state model largely intact.

The primary rule is: do not combine toolchain migration with a large state architecture rewrite.

Phase 1 state approach:

- Keep the top-level gameplay state in the migrated runtime component.
- Continue using React component state for the existing orchestration flow.
- Do not introduce Zustand, Redux, Jotai, or another external state library yet.
- Create a persistence boundary so state storage concerns are separated even if state ownership remains in one large component.

This preserves behavior while preparing for later extraction.

## Persistence Design

The project currently stores data in browser `localStorage`, with at least these keys present in `index.html`:

- `g_pl`
- `g_inv`

Phase 1 persistence requirements:

- Preserve compatibility with these existing keys.
- Move direct storage access into `src/game/persistence.ts`.
- Expose a small API surface for runtime use:
  - `loadGameState()`
  - `saveGameState()`
  - `clearGameState()`
  - `migrateGameState()`
- Support missing-field repair for older saves by filling defaults instead of crashing.
- Optionally add a lightweight metadata key such as `g_meta` for migration/version bookkeeping, but only if it does not interfere with loading existing saves.

The compatibility rule is strict: old saves should continue to load unless they are already invalid under the current runtime.

## TypeScript Strategy

TypeScript is being adopted for safer migration, not for immediate perfect typing.

Rules for phase 1:

- Prefer explicit interfaces/types for high-value runtime objects.
- Accept temporary broad types where the shape is still being discovered, but keep those localized.
- Do not block the migration on perfect typing of every affix, quest, or auction edge case.
- Tighten types as extraction proceeds.

The initial type set should at least cover:

- `Player`
- `Equipment`
- `Item`
- `Affix`
- `BattleReplay` / battle log entry shapes
- inventory collections
- quest progress state
- arena state that is required by the current UI
- persistence payload shapes

## CSS Strategy

Phase 1 styling should preserve identity, not redesign it.

Rules:

- Move global document and theme styles into `tokens.css` and `globals.css`.
- Keep the current medieval / gladiator visual tone.
- Do not force a full CSS Modules conversion in the first pass.
- If one or two leaf components are extracted during the migration, those extracted components may use CSS Modules.

This keeps the first pass focused on runtime migration while still moving styling in the right direction.

## Migration Phases

### Phase A: Build Skeleton

Create the new toolchain and minimal application shell.

Deliverables:

- `package.json`
- `tsconfig.json`
- `index.html`
- `src/main.tsx`
- `src/App.tsx`
- `src/styles/globals.css`
- `src/styles/tokens.css`

Acceptance criteria:

- `npm install` succeeds.
- `npm run dev` starts a working dev server.
- The React app mounts successfully.
- The build has no dependency on CDN React or Babel Standalone.

### Phase B: Monolith Port

Port the current runtime from `index.html` into `src/legacy/game.tsx` with the fewest behavior changes possible.

Deliverables:

- Main gameplay runtime moved out of inline HTML script.
- Imports updated to module-based React usage.
- Minimal TS changes required for compilation.

Acceptance criteria:

- The main game UI renders.
- Major tabs appear.
- Core interactions can be triggered.
- The runtime no longer depends on globally injected React APIs.

### Phase C: Persistence Boundary

Extract storage behavior into dedicated modules.

Deliverables:

- `src/game/constants.ts`
- `src/game/types.ts`
- `src/game/persistence.ts`

Acceptance criteria:

- Existing saves load.
- New saves persist.
- Refreshing the page restores key state.
- Direct `localStorage` access is consolidated into the persistence layer.

### Phase D: Near-Complete Feature Validation

Confirm that the migrated app is close to the current `index.html` runtime in usable feature coverage.

Validation targets:

- expeditions
- dungeons
- shop
- inventory and equipment
- enhancement and training
- quests
- arena
- replay / loot popup

Acceptance criteria:

- Each system is reachable in the migrated app.
- Each system supports its main path without obvious missing screens or dead-end interactions.
- The gameplay loop remains usable: combat/reward -> inventory/equipment/economy -> progression -> repeat.

### Phase E: Minimal Cleanup For Future Extraction

Perform only the smallest structural cleanup that improves maintainability without risking feature parity.

Allowed cleanup examples:

- extract persistence
- extract constants
- extract initial types
- extract one or two low-risk presentational components

Not allowed in phase 1:

- broad feature slicing into many folders
- combat system rewrite
- state management rewrite
- aggressive CSS rewrite

Acceptance criteria:

- The app remains near-feature-complete.
- The codebase is slightly easier to reason about than the original inline runtime.
- Phase 2 extraction can proceed without undoing phase 1 decisions.

## Verification Strategy

Because the source application is a large monolithic browser game, verification should combine build checks with explicit manual gameplay checks.

Required verification for phase 1:

- `npm run dev`
- `npm run build`
- manual save-load verification
- manual gameplay smoke checks covering:
  - one expedition
  - one dungeon
  - one shop purchase
  - one item equip or unequip
  - one sell action
  - one enhancement or one training action
  - one quest interaction/check
  - one arena interaction
  - one refresh confirming persistence still works

Automated unit tests are encouraged only after pure logic starts to be extracted. They are not the lead mechanism for validating the first whole-file migration.

## Risks And Mitigations

### Risk: Feature Drift Between `index.html` And Snapshot Files

Mitigation:

- Always check `index.html` first when behavior is unclear.
- Use `App.jsx` only as an extraction convenience.

### Risk: Type Tightening Breaks Dynamic Runtime Shapes

Mitigation:

- Start with permissive but explicit migration-safe types.
- Tighten types only after runtime parity is established.

### Risk: Persistence Breaks Existing Saves

Mitigation:

- Keep `g_pl` and `g_inv` compatibility.
- Add migration/default-repair behavior.
- Avoid changing payload structure without a conversion step.

### Risk: Over-Refactoring During Port

Mitigation:

- Prefer direct porting to architectural cleanup.
- Limit first-pass extraction to high-confidence boundaries.

### Risk: CSS Rewrite Slows Functional Migration

Mitigation:

- Move only global and token-level styles first.
- Delay wide CSS Modules adoption until after runtime parity.

## Decision Summary

The approved approach is:

1. Use `index.html` as the authoritative behavior baseline.
2. Build a new `Parcel + React 19 + TypeScript` app.
3. Port the monolithic runtime into `src/legacy/game.tsx` with minimal behavioral change.
4. Extract only the smallest valuable boundaries in phase 1: entrypoint, styles, constants, types, and persistence.
5. Preserve old save compatibility.
6. Reach near-complete parity with the current runtime before beginning deeper modular extraction.

## Phase 2 Direction

After phase 1 is stable, the next planning cycle should focus on controlled extraction in this order:

1. types refinement
2. static data modules
3. pure gameplay systems
4. low-risk presentational components
5. feature-level UI splits
6. improved state organization

That sequence preserves the working build while steadily reducing the legacy monolith.
