# Gladius-RPG Shop Sell Thresholds Design

**Date:** 2026-04-23

## Goal

Port the final upstream bulk-sell-by-rarity controls into the modular shop and inventory flows so players can choose a sell threshold instead of being limited to the older normal-item junk sale behavior.

## Upstream Final Behavior

The final upstream runtime adds a user-selectable sell threshold and exposes it in shop and inventory-adjacent selling flows.

Confirmed upstream markers include:

- `sellThreshold` state exists. `upstream/main:index.html:2397`
- Sell threshold selectors appear in the UI with rarity-based options. `upstream/main:index.html:4237-4259`, `4313-4328`
- The action text is `🗑 一鍵賣出`. `upstream/main:index.html:4255`
- Higher thresholds require confirmation for destructive mass-selling actions. `upstream/main:index.html:4251-4252`, `4326-4327`
- The selector and button styling change with the chosen threshold, reinforcing danger at higher rarities.

Behaviorally, this system extends junk selling from a hard-coded normal-item cleanup into a player-controlled mass-sell filter.

## Current Implementation Gap

The current migrated runtime still uses the old junk-sale logic.

- `sellJunk()` only targets `normal` rarity items. `src/legacy/game.tsx:2529-2536`
- There is no sell-threshold state.
- There is no threshold selector UI.
- There is no high-rarity confirmation flow.

This means the current runtime lacks one of the final upstream economy usability improvements.

## Modular Destination

The modular app should place this logic in:

- `src/features/shop/`
  - threshold selector control where the upstream selling flow exposes it
- `src/features/inventory/`
  - threshold selector if the upstream final runtime exposes the same selling affordance there
- `src/game/systems/economy.ts`
  - rarity threshold lookup
  - bulk sell candidate filtering
  - confirmation threshold helpers if represented as config
- `src/game/data/rarities.ts`
  - rarity ordering reused by sell filtering

The UI control can be shared, but sell eligibility logic should live in the economy layer.

## Data And State Boundaries

The modular app should explicitly model:

- current sell threshold selection
- rarity ordering used for threshold comparison
- candidate inventory items after excluding equipped items and protected item categories
- gold gained from the sale

The economy layer should accept inventory, equipment state, and selected threshold, then return:

- which items are eligible for bulk sell
- total gold gain
- whether a destructive confirmation prompt is required

## Fidelity Requirements

The modular implementation must preserve upstream intent for:

- threshold option labels and their order
- rarity cutoffs
- confirmation behavior for high-value thresholds
- exclusion rules for equipped items and special item classes

If the upstream runtime still excludes things like potions or mercenary scrolls from junk selling, the modular version must keep those exceptions.

## Migration Constraints

- Do not silently broaden the sell filter beyond the final upstream thresholds.
- Do not move protected-item logic into UI-only checks.
- Do not remove confirmation prompts for higher thresholds.
- Preserve the player-facing distinction between safe cleanup and risky mass liquidation.

## Acceptance Criteria

- The shop/inventory flow exposes a rarity-threshold sell selector matching the final upstream runtime.
- Bulk sell uses the selected threshold instead of a hard-coded normal-only rule.
- Equipped or protected items are still excluded.
- High-value threshold selections require confirmation before selling.
- Resulting gold gain and inventory removal match upstream behavior.

## Dependencies And Order

- Depends on shared rarity definitions and current inventory/equipment models.
- Can be implemented independently of tavern systems.
- Should land after the modular economy boundary exists so the rule does not stay embedded in UI event handlers.
