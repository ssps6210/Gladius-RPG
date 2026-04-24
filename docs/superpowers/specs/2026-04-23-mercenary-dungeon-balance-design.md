# Gladius-RPG Mercenary Dungeon Balance Design

**Date:** 2026-04-23

## Goal

Port the final upstream mercenary dungeon balance, survival logic, and reporting behavior into the modular app without flattening mercenary-specific rules into the generic player combat path.

## Upstream Final Behavior

The final upstream runtime continues to evolve mercenary content rather than leaving it as a static side mode.

Confirmed upstream-era changes include:

- Mercenary dungeon combat/reporting includes clearer party-size and survival context.
- Mercenary healer and recovery behavior were adjusted in later upstream commits.
- Mercenary attack, defense, and HP scaling were buffed in the later upstream final line.
- Wave recovery, boss handling, and final result summaries were also revised before the final upstream state.

The important design point is not a single isolated formula; it is that the final upstream runtime treats mercenary dungeon combat as a tuned subsystem with its own balance and report expectations.

## Current Implementation Gap

The current migrated runtime still reflects the older mercenary rule set.

- It lacks the full final upstream mercenary scaling pass.
- It lacks the final report/result polish that upstream added for mercenary runs.
- It does not yet expose a clearly modular mercenary rule boundary.

As a result, current mercenary play on `HEAD` is behind the designer's latest upstream version even though the mode itself exists.

## Modular Destination

The modular app should place this logic in:

- `src/game/systems/mercenaryCombat.ts`
  - mercenary unit generation and scaling
  - mercenary-versus-wave resolution
  - mercenary healing and survival rules
  - boss and reward handling for mercenary runs
- `src/features/dungeon/` or `src/features/mercenary/`
  - mercenary run UI
  - summary and replay presentation
- `src/game/types/`
  - mercenary unit state
  - mercenary run result and report payloads

If common combat helpers are reused, they should remain helpers. The mercenary subsystem still owns its distinctive formulas and resolution order.

## Data And State Boundaries

The modular app should explicitly model:

- mercenary roster generated from scroll rarity and modifiers
- per-wave mercenary survival state
- healer effects and between-wave recovery
- boss reward/output summary
- mercenary run report data separate from standard battle report data when the shape differs

This system should not rely on UI strings to reconstruct mercenary outcomes.

## Fidelity Requirements

The modular implementation must preserve final upstream behavior for:

- mercenary stat floors and scaling
- healer contribution and recovery timing
- enemy damage interaction with mercenary defense
- final run summary and player-facing explanation

Because the upstream final state represents a tuning pass, formula order matters. The modular version should copy the final formulas before considering cleanup.

## Migration Constraints

- Do not rebalance mercenary combat based on intuition or older versions.
- Do not share generic player-combat formulas where upstream clearly diverged for mercenaries.
- Keep the final report flow expressive enough that players can understand why a run succeeded or failed.
- Keep mercenary-specific drop/reward differences if they exist in the final upstream runtime.

## Acceptance Criteria

- Mercenary dungeon runs use the final upstream balance and survival semantics.
- Mercenary healer and between-wave recovery behave like the final upstream runtime.
- Final mercenary run summaries communicate party survival, losses, and rewards with upstream-equivalent clarity.
- The mercenary subsystem is implemented as its own rule boundary rather than hidden inside generic dungeon code.

## Dependencies And Order

- May reuse shared combat helpers from the combat/progression spec.
- Does not depend on tavern systems.
- Should be implemented after enough modular combat extraction exists to support shared helpers without forcing mercenary logic back into a monolith.
