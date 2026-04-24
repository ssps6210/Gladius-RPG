# Gladius-RPG Tavern Bounties And Story Rewards Design

**Date:** 2026-04-23

## Goal

Port the final upstream tavern bounty board, tavern quest progression, and narrative reward presentation into the modular app while keeping them distinct from the older quest system.

## Upstream Final Behavior

The final upstream runtime turns the tavern into both a recovery hub and a narrative bounty board.

Confirmed upstream markers include:

- A tavern quest board state `tavernBoard`. `upstream/main:index.html` final runtime structure around tavern section
- A tavern story reward popup state `storyPopup`. `upstream/main:index.html:2411`, `4429-4497`
- Dedicated tavern UI copy describing bounty acceptance and kill-target progress. `upstream/main:index.html:3855-3857`
- The final story reward presentation includes heading `QUEST COMPLETE`. `upstream/main:index.html:4455`
- The final reward confirmation action uses `收下賞金，離開酒館`. `upstream/main:index.html:4497`
- Upstream quest data includes `lore`, `hint`, and `conclusion` text for tavern quests. Examples appear throughout the tavern quest data block in `upstream/main:index.html`.

Behaviorally, this system is separate from the older `📋 任務` tab:

- The player accepts bounties from the tavern board.
- Combat kills update bounty progress.
- Completing a bounty returns the player to the tavern for claim flow.
- Claiming rewards can show a dedicated parchment/story presentation rather than a plain alert.

## Current Implementation Gap

The current migrated runtime has no tavern bounty layer.

- No tavern tab in navigation. `src/legacy/game.tsx:2924`
- No tavern quest board state or acceptance UI.
- No `storyPopup` equivalent.
- No narrative conclusion presentation.
- The existing quest tab remains the older quest system and should not be treated as a substitute.

The result is that one of the largest upstream content additions is entirely absent from the migrated runtime.

## Modular Destination

The modular app should place this system in:

- `src/features/tavern/`
  - tavern board panel
  - active tavern quest tracker in tavern context
  - story reward modal or parchment presentation
- `src/game/data/tavernQuests.ts`
  - bounty definitions including monster targets, rewards, lore, hints, and conclusion text
- `src/game/systems/tavernQuests.ts`
  - board generation and refresh
  - accept/abandon/claim rules
  - kill-progress application
  - story reward state transitions
- `src/game/types/`
  - tavern quest definition and active tavern quest state
  - story reward popup state

The existing standard quest system may stay separate in its own modules. Shared helpers are acceptable only if semantics stay distinct.

## Data And State Boundaries

The modular app should explicitly model:

- the available tavern board entries
- the accepted tavern quest, if the upstream system allows only one active quest at a time
- progress counters keyed by target monster or target family
- reward claim availability
- story popup display state, including title, icon, conclusion text, and reward payload

The combat layer must expose enough structured kill data for tavern progression to update without parsing log text.

Board refresh behavior should remain faithful to upstream, including any gold cost or timing semantics that exist in the final runtime.

## Content Preservation

This system carries authored narrative content, not just mechanics. The modular app must preserve:

- Traditional Chinese quest text
- `lore`, `hint`, and `conclusion` fields
- the reward reveal structure and parchment-like presentation intent

If content is moved into a data file, it should be copied faithfully from the final upstream runtime rather than re-authored.

## Migration Constraints

- Do not merge tavern bounties into the existing daily/weekly/achievement quest taxonomy.
- Do not replace the story reward popup with a generic toast if upstream gives a dedicated conclusion presentation.
- Do not depend on raw battle log strings for quest progress.
- Preserve the final upstream naming and narrative tone unless a localization cleanup is explicitly requested later.

## Acceptance Criteria

- The tavern page exposes a bounty board with upstream-equivalent quest entries and descriptive text.
- The player can accept, abandon, track, and claim tavern quests as the final upstream runtime allows.
- Relevant dungeon or battle kills update tavern quest progress.
- Completed tavern quests display the final reward flow with explicit narrative conclusion content.
- The standard quest tab remains separate and does not absorb tavern bounty semantics.

## Dependencies And Order

- Depends on the tavern page existing from the tavern/recovery spec.
- Depends on combat output being able to provide kill-result data.
- Should be implemented after the tavern shell and after enough combat/progression modularization exists to emit structured results.
