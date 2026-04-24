# Gladius-RPG Upstream Feature Absorption Overview Design

**Date:** 2026-04-23

## Goal

Define how to absorb the gameplay and UI behavior that exists in `upstream/main:index.html` but is not yet represented by the migrated runtime on `HEAD`.

This spec is intentionally post-migration and post-modularization oriented. It does not ask for more edits inside the transitional monolith beyond what is needed for gap analysis. Its purpose is to preserve the core designer's latest upstream behavior while giving the future modular app a clean import path for each feature domain.

## Source Of Truth And Comparison Baseline

- Upstream behavior truth: `upstream/main:index.html`
- Current migrated runtime baseline: `src/legacy/game.tsx`
- Legacy preservation reference on current branch: `legacy-index.html`
- Existing migration context: `docs/superpowers/specs/2026-04-23-minimal-runnable-migration-design.md`

The comparison rule is strict:

- If `upstream/main:index.html` contains a final behavior that is missing or older on `HEAD`, the upstream behavior wins.
- Intermediate upstream snapshots such as `gladius (5).html` or `gladius (8).html` are historical evidence only. They are not target behavior if `upstream/main:index.html` evolved further.
- The transitional runtime in `src/legacy/game.tsx` is a migration host, not a design authority.

## Scope

This absorption effort covers the final upstream behavior for six domains:

1. Tavern and recovery flow
2. Tavern bounty board and story reward flow
3. Combat and progression balance updates
4. Shop sell-threshold controls
5. Mercenary dungeon balance and report flow
6. Upstream UI text and footer additions

This effort does not cover unrelated redesign, visual restyling beyond parity, or speculative rebalancing beyond what is present on `upstream/main`.

## Current Gap Summary

The current migrated runtime on `HEAD` preserves an older playable feature set, but it does not yet absorb most of the latest upstream gameplay work.

Confirmed user-visible gaps include:

- No `🍺 酒館` tab in the current navigation. `src/legacy/game.tsx:2924`
- No tavern lodging flow or inn panel in the current runtime.
- No dungeon injury cooldown state or recovery path in the current runtime.
- No tavern bounty board, tavern quest acceptance flow, or story reward popup in the current runtime.
- No sell-threshold UI for bulk selling by rarity in the current runtime; current `sellJunk()` still targets normal items only. `src/legacy/game.tsx:2529-2536`
- No full upstream mercenary dungeon balance pass in the current runtime.
- No coffee footer in the actual migrated runtime component; it only exists in `legacy-index.html:3619-3630`.

## Feature Domain Specs

The downstream implementation should use the following spec set:

- `2026-04-23-tavern-and-recovery-design.md`
- `2026-04-23-tavern-bounties-and-story-rewards-design.md`
- `2026-04-23-combat-and-progression-balance-design.md`
- `2026-04-23-shop-sell-thresholds-design.md`
- `2026-04-23-mercenary-dungeon-balance-design.md`
- `2026-04-23-upstream-ui-text-and-footer-design.md`

## Recommended Modular Destination

After the larger app refactor is complete, the absorbed upstream behavior should land in these kinds of boundaries:

- `src/game/data/`
  - static tavern quest definitions
  - rarity threshold metadata
  - any upstream-only presentation content that is not hard-coded UI copy
- `src/game/types/`
  - player recovery status
  - tavern quest state and story reward state
  - combat result extensions needed for injuries and kill tracking
- `src/game/systems/`
  - recovery and injury logic
  - tavern quest progression and reward application
  - combat/progression adjustments
  - shop bulk sell threshold rules
  - mercenary dungeon rules
- `src/features/`
  - tavern feature shell
  - shop and inventory bulk sell controls
  - mercenary dungeon presentation
- `src/components/`
  - reusable story reward modal or parchment card component
  - optional injury notice or status card if reused in multiple places

The modular goal is to preserve upstream behavior while reducing coupling, not to reinvent the domain model.

## Cross-Domain Data Flow

Several absorbed systems depend on shared result flows. The future modular design must keep these relationships explicit:

1. Combat resolution produces win/loss state, damage outcome, and kill records.
2. Progression resolution applies EXP, level-up, HP changes, and any final recovery semantics.
3. Recovery rules consume combat outcomes to determine injury lockouts and tavern rest requirements.
4. Tavern bounty progression consumes kill records from dungeon and battle results.
5. Story reward flow consumes tavern quest completion, then emits UI-ready reward presentation state.
6. Shop bulk-sell rules consume inventory, equipment usage, and rarity ordering.
7. Mercenary dungeon flow may reuse common combat helpers, but its scaling and survival rules remain domain-specific.

## Migration Constraints

- Preserve final upstream behavior before considering cleanup.
- Keep the existing save compatibility strategy explicit. If new state must persist, add a migration path rather than silently changing shapes.
- Do not merge tavern bounty semantics into the existing `📋 任務` system just because both are quests.
- Do not collapse mercenary dungeon rules into the main player combat rules if upstream treats them differently.
- Do not use the current migrated runtime's older behavior as a reason to reject the upstream design.
- Do not introduce unrelated UI redesign while porting parity features.

## Recommended Execution Order

1. Combat and progression balance updates
2. Tavern and recovery flow
3. Tavern bounty board and story rewards
4. Shop sell-threshold controls
5. Mercenary dungeon balance and reporting
6. UI text and footer parity pass

This order keeps shared combat output stable before recovery and tavern quest systems depend on it.

## Definition Of "Absorbed"

A feature is considered absorbed only when all of the following are true:

- The user can reach the same upstream interaction path in the modular app.
- The gameplay rule outcome matches the final upstream runtime.
- Supporting UI text, warnings, and result presentation are present where they materially affect understanding.
- State transitions survive page refresh if the upstream system expects persistence.
- The new module boundary is explicit enough that later refactors do not need to rediscover the rule from the old monolith.

## Acceptance Criteria

- The modular app exposes all six upstream feature domains listed in this spec.
- Each domain matches the final behavior of `upstream/main:index.html`, not an intermediate snapshot.
- The migrated feature set no longer depends on `src/legacy/game.tsx` as the only place where the rule can exist.
- There is a clear dependency-aware implementation path from shared combat outputs to tavern, shop, and mercenary systems.

## Dependencies

- Depends on the broader modular refactor completing enough extraction to support feature-level modules.
- Acts as the ordering and boundary reference for the six function-domain specs.
- Should be read first before implementing any individual upstream absorption task.
