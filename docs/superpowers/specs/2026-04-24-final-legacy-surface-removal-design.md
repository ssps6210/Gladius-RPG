# Final Legacy Surface Removal Design

**Goal:** Remove the remaining `src/legacy/` directory entirely, migrate its contents into canonical non-legacy locations, and eliminate the `Legacy*` type names from the active app code so today's refactor can be considered structurally complete.

**Non-goals:**
- No push to remote.
- No broad redesign of gameplay logic or UI.
- No aggressive type-tightening that risks behavior drift.

## Current State

The playable app no longer uses `src/legacy/game.tsx`, but `src/legacy/` still exists as a residual compatibility surface:

- `src/legacy/types.ts`
- `src/legacy/game.css`
- `src/legacy/game.test.ts`

The remaining active code still imports these assets indirectly:

- `src/game/GameApp.tsx` imports `../legacy/game.css`
- `src/game/useGameState.ts` imports `Legacy*` types from `../legacy/types`
- feature components such as `QuestTab`, `ArenaTab`, and `BattleReport` also import `Legacy*` types

This means the runtime is modularized, but the codebase still advertises an unfinished migration boundary.

## Design Summary

Complete the cleanup in one focused pass:

1. Move the residual CSS into a canonical non-legacy path.
2. Move the residual wide transitional types into a canonical `src/game/` type module.
3. Rename the exported transitional types from `Legacy*` to stable app-facing names.
4. Rewire all imports to the new module paths and names.
5. Move the stray test file next to the module it actually covers.
6. Delete `src/legacy/`.
7. Re-run verification after removing the old worktree that currently pollutes test discovery.

## File Layout

### New/target locations

- `src/game/appTypes.ts`
  - Home for the current app-facing wide object shapes previously exported from `src/legacy/types.ts`
  - Keeps the existing permissive structure used by save migration and UI orchestration, but without legacy naming

- `src/game/game.css`
  - Home for the extracted global game stylesheet currently stored at `src/legacy/game.css`

- `src/game/lib/display.test.ts`
  - Home for the current train stat display mapping test now mislocated at `src/legacy/game.test.ts`

### Files to update

- `src/game/GameApp.tsx`
- `src/game/useGameState.ts`
- `src/features/quests/QuestTab.tsx`
- `src/features/arena/ArenaTab.tsx`
- `src/features/battle/BattleReport.tsx`
- any additional files still importing `src/legacy/*`

## Type Strategy

The current `Legacy*` types serve two jobs:

1. They expose runtime entities to the UI.
2. They intentionally preserve loose fields and old-compatible object shapes.

Today we only remove the legacy boundary, not the permissive behavior. So the types will keep their current structural looseness, but be renamed to stable app-facing names.

Planned renames:

- `LegacyItem` -> `GameItem`
- `LegacyPlayer` -> `GamePlayer`
- `LegacyQuestState` -> `GameQuestState`
- `LegacyArenaOpponent` -> `GameArenaOpponent`
- `LegacyReplay` -> `GameReplay`
- `LootDrop` can remain `LootDrop`

Helper aliases like `AnyRecord` and `AnyList` can remain if still useful.

This preserves behavior while removing the implication that the active app still depends on a temporary legacy layer.

## CSS Strategy

`src/legacy/game.css` is no longer legacy in practice; it is the active game stylesheet. The right move is to relocate it, not rewrite it.

Move it to `src/game/game.css` and update `GameApp.tsx` to import from the new path. Keep the content unchanged unless an import path or build issue forces a minimal edit.

## Test Strategy

This work is a refactor, so it follows TDD discipline:

1. Add or relocate tests first so coverage exists at the new destination.
2. Run the relevant test and verify it passes/fails for the expected reason during the move.
3. Rewire production imports with minimal behavior change.
4. Run focused tests, then full verification.

Because the current `src/legacy/game.test.ts` does not test the deleted game file and only covers `TRAIN_STAT_DISPLAY_KEYS`, it should move next to the display module under `src/game/lib/`.

## Worktree Cleanup Requirement

Current full-suite verification is contaminated by `.worktrees/legacy-logic-extraction`, whose tests are being discovered by Vitest from the main workspace. That must be removed before final sign-off.

Order matters:

1. Finish code migration.
2. Remove the stale worktree.
3. Re-run verification in the main workspace.

## Verification Requirements

Completion requires fresh successful runs of:

- `npm run typecheck`
- `npm test`
- `npm run build`

Success means:

- no `src/legacy/` directory remains
- no imports remain from `legacy/*`
- no `Legacy*` type names remain in active app code
- test discovery no longer includes the removed worktree

## Documentation/Git Expectations

The `docs/superpowers/` documents should be preserved in git for knowledge-sharing and TDD workflow study. This design only defines the code and file-structure cleanup; pushing to remote is explicitly deferred.
