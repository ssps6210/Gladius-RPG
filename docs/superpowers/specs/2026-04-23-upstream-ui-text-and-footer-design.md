# Gladius-RPG Upstream UI Text And Footer Design

**Date:** 2026-04-23

## Goal

Capture the upstream final UI text additions and footer parity work that materially affect the player's understanding of newly absorbed features, especially tavern story rewards and the final footer link.

## Upstream Final Behavior

The final upstream runtime includes several user-facing text and presentation details that should be preserved as part of feature parity, not treated as incidental polish.

Confirmed upstream markers include:

- The tavern story reward popup uses the heading `QUEST COMPLETE`. `upstream/main:index.html:4455`
- The final tavern reward confirmation action says `收下賞金，離開酒館`. `upstream/main:index.html:4497`
- Tavern UI copy introduces the bounty board and explains its purpose. `upstream/main:index.html:3855-3857`
- The final footer includes `☕ Buy the developer a coffee!`. `upstream/main:index.html:4537`

These are part of the final upstream authored presentation. They shape how players read the new systems and recognize the designer's intended tone.

## Current Implementation Gap

The current migrated runtime only partially preserves this material.

- The coffee footer exists in `legacy-index.html:3619-3630` but not in the actual runtime component.
- The current runtime does not have the tavern story reward popup, so the associated heading and confirmation text are also absent.
- The current runtime lacks the tavern explanatory copy because the tavern feature itself is missing.

## Modular Destination

The modular app should place this material in the feature modules that own the behavior:

- `src/features/tavern/`
  - tavern headings, explanatory text, reward action labels
- `src/components/StoryModal/` or equivalent
  - `QUEST COMPLETE` heading and related parchment reward presentation
- layout shell or `src/App.tsx`
  - footer placement for the coffee link

If the app later centralizes user-facing strings, these strings may move into a content file, but the first goal is parity.

## Data And Presentation Boundaries

The modular UI should distinguish between:

- authored narrative content that belongs with tavern quest definitions
- system labels and action text that belong with feature UI or shared components
- site-level footer content that belongs with the app shell

This prevents reward story text from being mixed with generic UI constants and keeps feature ownership clear.

## Fidelity Requirements

The modular app should preserve:

- the final Traditional Chinese copy where upstream uses it
- the explicit English heading `QUEST COMPLETE` where upstream uses it
- the existence and destination of the coffee footer link
- the general parchment/reward presentation intent for the story reward modal

Equivalent structure is acceptable if the internal component implementation changes, but the player-visible wording should remain faithful.

## Migration Constraints

- Do not treat these strings as optional polish after implementing logic.
- Do not replace feature-specific explanatory text with generic placeholders.
- Do not drop the footer link simply because it lives outside the main game systems.
- Keep the final upstream mixture of Chinese UI and authored English heading where it is intentional.

## Acceptance Criteria

- The final modular tavern reward flow includes the `QUEST COMPLETE` heading and the `收下賞金，離開酒館` action text.
- The tavern page includes its explanatory upstream copy.
- The app shell includes the coffee footer link in a visible final location.
- The absorbed UI text reads like the final upstream runtime rather than a rewritten approximation.

## Dependencies And Order

- Depends on tavern bounty/story reward flow existing.
- May be completed last as a parity pass after the related feature modules exist.
- Should still be treated as required scope for feature absorption, not optional cleanup.
