# Gladius-RPG Tavern And Recovery Design

**Date:** 2026-04-23

## Goal

Port the final upstream tavern lodging and injury-recovery flow into the modular app so that dungeon and arena lockouts, HP restoration, and tavern recovery behavior match `upstream/main:index.html`.

## Upstream Final Behavior

The final upstream runtime adds a tavern tab and uses it as the home for both recovery and bounty activity.

Confirmed upstream markers include:

- `InnPanel` exists in the final upstream runtime. `upstream/main:index.html:2037`
- Dungeon injury cooldown is tracked with `dungeonInjuredUntil`. `upstream/main:index.html:2407`
- Arena injury cooldown is tracked with `arenaInjuredUntil`. `upstream/main:index.html:2404`
- Dungeon entry is blocked while injured and the player is told to go to the tavern to recover. `upstream/main:index.html:2906-2908`, `2941-2943`
- The tavern tab is present in primary navigation. `upstream/main:index.html:3503`
- The UI shows a dungeon injury warning and a direct tavern recovery call to action. `upstream/main:index.html:3530-3548`
- The tavern view contains a lodging panel labeled `酒館旅店`. `upstream/main:index.html:2061`
- Resting fully restores HP and clears both dungeon and arena lockouts.
- Upstream also auto-clears dungeon injury when the player reaches full HP through other means. `upstream/main:index.html:2415-2418`

Behaviorally, the tavern is not optional decoration. It becomes the explicit recovery hub that resolves failure consequences and reduces confusion around lockouts.

## Current Implementation Gap

The current migrated runtime does not expose this system yet.

- The current nav has no `tavern` tab. `src/legacy/game.tsx:2924`
- No `InnPanel` equivalent exists in `src/legacy/game.tsx`.
- No dungeon injury state exists in the current migrated runtime.
- Arena injury state is not represented as the same upstream recovery contract.
- There is no shared recovery page that clears both injury states and restores HP.

This means the current app still behaves like the pre-tavern upstream runtime, even though the designer's latest upstream version makes recovery a first-class feature.

## Modular Destination

The modular app should place this system in:

- `src/features/tavern/`
  - tavern page container
  - inn/recovery panel UI
  - injury notice UI reused inside the tavern page if needed
- `src/game/systems/recovery.ts`
  - injury timestamp rules
  - rest action logic
  - auto-clear rules when HP reaches full
- `src/game/types/`
  - player recovery status or app-level recovery state shape

The tavern page should host both inn recovery and tavern bounty systems, but recovery logic must remain independently testable.

## Data And State Boundaries

The modular app should explicitly track:

- `dungeonInjuredUntil: number`
- `arenaInjuredUntil: number`
- the player's current HP and computed max HP
- whether recovery actions are available or unnecessary

The recovery system should define clear inputs and outputs:

- Input: player HP, max HP, current time, lockout timestamps
- Output: whether the player is injured, remaining minutes, whether rest is needed, and the updated player and lockout state after rest

Combat and arena result handlers should not hard-code tavern UI behavior. They should emit updated recovery state, and the tavern feature should render it.

## Persistence Expectations

If the modular app persists player recovery state, the injury timestamps must survive refresh in a migration-safe way. The save design must make it obvious whether the injury fields live inside player state or adjacent app state.

Because the upstream runtime uses timestamp lockouts, a restored save should continue counting down from persisted values rather than resetting silently.

## Migration Constraints

- Match upstream lockout semantics before optimizing naming or file placement.
- Keep tavern rest behavior faithful: full heal plus clearing both lockouts.
- Preserve the player-facing wording and affordance that directs users to the tavern after failure.
- Keep the auto-clear behavior when HP reaches full from other sources.
- Do not collapse dungeon and arena injury into a single generic flag unless the final modular design can still reproduce the independent timestamps and UI.

## Acceptance Criteria

- The main navigation includes `🍺 酒館`.
- Entering dungeons while dungeon-injured is blocked with the same upstream intent and messaging.
- The tavern page shows a lodging panel that explains recovery and current lockouts.
- Using the lodging/rest action restores HP to full and clears both injury timers.
- If the player reaches full HP through other means, dungeon injury auto-clears as upstream does.
- Refreshing the page preserves injury state if the modular persistence model includes it.

## Dependencies And Order

- Depends on combat/progression outputs being able to signal loss outcomes and updated HP.
- Should be implemented before tavern bounty features so the tavern page has its core shell and state model.
- Will be reused by the tavern bounty spec as part of the shared tavern feature container.
