# Gladius-RPG Combat And Progression Balance Design

**Date:** 2026-04-23

## Goal

Port the final upstream combat and progression adjustments that materially change player-facing outcomes, especially level-up healing, speed-related combat advantages, and any shared result data needed by later systems.

## Upstream Final Behavior

The final upstream runtime evolves several combat and progression details beyond the older migrated baseline.

Confirmed upstream markers include:

- Level-up now fully heals the player. `upstream/main:index.html:2439-2444`
- Combat uses explicit speed estimation and upstream adds speed-advantage behavior in the later runtime family.
- Final runtime logic feeds injury and tavern progression systems from battle outcomes rather than treating combat as a sealed subsystem.
- The final runtime updates `highestLevel` and other progression fields consistently when applying dungeon and battle rewards. Evidence appears around `upstream/main:index.html:2919`, `2951`, `3016`, `3328`.

The key design takeaway is that combat resolution in the final upstream runtime emits richer state consequences than the older migrated version. It no longer only decides win/loss and rewards; it also affects recovery, progression, and follow-on systems.

## Current Implementation Gap

The current migrated runtime still reflects an older combat/progression contract.

- It predates the final upstream tavern-linked recovery flow.
- It does not provide the same explicit downstream support for tavern bounty progression.
- It lacks the final upstream overall parity for recent combat and balance changes.

Some nearby logic has already been improved locally, such as the train stat display mapping, but that does not close the upstream combat parity gap.

## Modular Destination

The modular app should place this logic in:

- `src/game/systems/combat.ts`
  - player-versus-monster combat loop
  - speed-advantage handling and related battle log entries
  - structured combat result output
- `src/game/systems/progression.ts`
  - EXP gain
  - level-up logic
  - highest-level tracking
  - final HP outcome after reward application
- `src/game/types/`
  - structured combat result
  - structured kill-result payload
  - progression result payload if kept separate

If arena or dungeon-specific result wrappers exist, they should consume a common combat/progression core rather than duplicating the shared rules.

## Data And State Boundaries

The modular combat/progression layer should explicitly return enough information for later systems:

- outcome: win, loss, draw, escape if relevant
- enemy or wave kill records
- reward payload: EXP, gold, loot candidates, special drops
- updated player state after progression resolution
- derived downstream signals such as whether recovery lockout rules should be checked

This means later feature modules should not need to infer kill counts or level-up state from UI log strings.

## Fidelity Requirements

The future modular implementation must faithfully copy the final upstream formulas and rule ordering, including:

- when level-up occurs relative to reward application
- whether HP is recalculated or overwritten on level-up
- how speed affects turn order or extra actions
- how shared player progression fields are updated

Where the upstream runtime embeds these rules inline, the modular version may extract them, but it must preserve execution order.

## Migration Constraints

- Do not rebalance the game beyond the final upstream runtime.
- Do not normalize formulas just because an extracted system looks cleaner with simplification.
- Keep combat logs user-visible and behaviorally compatible where they help explain upstream mechanics.
- Expose structured outputs rather than coupling downstream systems to log text.

## Acceptance Criteria

- Level-up healing matches the final upstream behavior.
- Speed-related combat effects match the final upstream runtime in both outcome and player-facing explanation.
- Downstream systems can consume structured kill and result data without scraping logs.
- Progression fields such as `highestLevel` update with the same outcome timing as the final upstream runtime.

## Dependencies And Order

- Should be implemented before tavern recovery and tavern bounty systems.
- Provides the shared result contract that recovery, quest progression, and some mercenary logic will depend on.
- Can be partially shared with mercenary combat helpers, but the mercenary spec remains authoritative for merc-only rules.
