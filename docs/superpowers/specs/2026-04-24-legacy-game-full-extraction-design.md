# Legacy Game Full Extraction — Phase 2 Design

**Goal:** Completely delete `src/legacy/game.tsx` by extracting all remaining content into proper modular homes. The file currently has 2452 lines after Phase 1 cleanup.

**Approach:** Bottom-up — extract leaves first (pure components, CSS), then the shared state hook, then tab feature components, finally assemble a new `GameApp` and delete the legacy file.

**Tech Stack:** TypeScript 5, Vitest 3, React 19, Vite

---

## Architecture Overview

Four task groups, each independently committable:

```
Task A — Sub-components + CSS
Task B — useGameState hook
Task C — Tab feature components
Task D — GameApp assembly + file deletion
```

No changes to `src/game/systems/`, `src/game/data/`, or `src/game/lib/`.

---

## Task A: Sub-components + CSS

### CSS

Extract the 640-line `const css = \`...\`` string from `game.tsx` to `src/legacy/game.css`. Replace `<style>{css}</style>` with `import "./game.css"`. Behavior is equivalent — the CSS was already globally scoped via the style tag.

### Pure UI components (no internal state) → `src/components/`

| Component    | Source lines | Destination                       | Props signature                        |
|--------------|-------------|-----------------------------------|----------------------------------------|
| `AffixLines` | ~759        | `src/components/AffixLines.tsx`   | `{ affixes: any[] }`                   |
| `HpBar`      | ~830        | `src/components/HpBar.tsx`        | `{ cur, max, color?, thin? }`          |
| `ReplayLog`  | ~839        | `src/components/ReplayLog.tsx`    | `{ lines, cursor }`                    |
| `BattleLog`  | ~873        | `src/components/BattleLog.tsx`    | `{ log }`                              |
| `ItemCard`   | ~778        | `src/components/ItemCard.tsx`     | `{ item, onEquip?, onUse? }`           |
| `LootPopup`  | ~894        | `src/components/LootPopup.tsx`    | `{ item, onEquip, onTake, onDiscard }` |

### Feature components with internal state → `src/features/`

These are already standalone functions in `game.tsx`; they just need to move to their own files with props signatures unchanged.

| Component  | Source lines | Destination                           | Props signature                                                                        |
|------------|-------------|---------------------------------------|----------------------------------------------------------------------------------------|
| `QuestTab` | ~942–1079   | `src/features/quests/QuestTab.tsx`    | `{ player, inventory, questState, onCollect }`                                         |
| `ArenaTab` | ~1080–1212  | `src/features/arena/ArenaTab.tsx`     | `{ player, arenaOpponents, arenaInjuredUntil, arenaRefreshes, onRefresh, onFight, onInit }` |

Each extraction: move code → add import in `game.tsx` → delete inline definition → `typecheck + npm test` → commit.

---

## Task B: `useGameState` Hook

**File:** `src/game/useGameState.ts`

Extract all state and logic from the `App` component body into a single custom hook. The hook returns a flat object. This is a pure mechanical move — no logic changes, no handler decomposition.

### Contains

**State (useState):**
- `player`, `inventory`
- `tab`, `replay`, `lootDrop`
- `selectedScrolls`, `saveMsg`
- `shopFilter`, `invFilter`, `shopItems`, `auctionItems`, `shopTab`, `bidInput`
- `enhanceTarget`, `enhanceLog`, `enhanceAnim`
- `arenaOpponents`, `arenaInjuredUntil`, `arenaRefreshes`, `arenaLastDate`
- `questState`, `questNotify`

**Handlers:**
`save`, `reset`, `lvUp`, `startBattle`, `startExpedition`, `takeLoot`, `discardLoot`, `equipLootNow`, `startMercBattle`, `usePotion`, `buyItem`, `sellItem`, `sortInventory`, `sellJunk`, `refreshShop`, `doEnhance`, `doTrain`, `initArena`, `arenaRefresh`, `startArenaBattle`, `collectQuest`, `updateQuestProgress`, `refreshAuction`, `placeBid`, `claimAuction`, `equipItem`, `unequip`

**Derived values:**
`tAtk`, `tDef`, `tMhp`, `tSpd`, `pSpec`, `wCat`, `hpPct`, `expPct`, `potions`, `mercScrollsInInv`, `selectedScrollObjs`, `filteredShop`, `filteredInv`, `SLOT_FILTERS`

### After extraction

`App` in `game.tsx` becomes:
```tsx
function App() {
  const state = useGameState();
  const { player, tab, ... } = state;
  return ( /* unchanged JSX, just reads from state */ );
}
```

Verify: `typecheck + npm test` green → commit.

> **Out of scope:** Internal decomposition of `useGameState` (e.g., splitting into per-feature hooks) is a separate future plan.

---

## Task C: Tab Feature Components

Extract each tab's JSX block from `App`'s return into its own component file. Props are explicit; types use `any` where needed to keep the migration mechanical (type refinement is a separate future task).

| Component      | Destination                                   | Key props                                                               |
|----------------|-----------------------------------------------|-------------------------------------------------------------------------|
| `DungeonTab`   | `src/features/dungeon/DungeonTab.tsx`         | `player`, `startBattle`, `startExpedition`                              |
| `TrainTab`     | `src/features/train/TrainTab.tsx`             | `player`, `doTrain`                                                     |
| `ShopTab`      | `src/features/shop/ShopTab.tsx`               | `player`, `shopItems`, `auctionItems`, `shopFilter`, `shopTab`, related handlers |
| `InventoryTab` | `src/features/inventory/InventoryTab.tsx`     | `player`, `inventory`, `invFilter`, `enhanceTarget`, `enhanceLog`, `doEnhance`, related handlers |
| `BattleReport` | `src/features/battle/BattleReport.tsx`        | `replay`, `player`                                                      |

`QuestTab` and `ArenaTab` are already extracted in Task A — reuse directly.

Each extraction: create file → replace inline JSX block with `<ComponentName ...state />` → `typecheck + npm test` → commit.

---

## Task D: GameApp Assembly + Cleanup

### New file: `src/game/GameApp.tsx`

```tsx
import "./game.css"; // or import from legacy location until moved
import { useGameState } from "./useGameState";
import { DungeonTab } from "../features/dungeon/DungeonTab";
import { TrainTab }   from "../features/train/TrainTab";
// ... other tab imports ...

export default function GameApp() {
  const state = useGameState();
  const { tab, player, replay, ... } = state;

  return (
    <div className="gw">
      {/* sidebar, nav bar */}
      {tab === "dungeon" && <DungeonTab player={player} startBattle={state.startBattle} ... />}
      {tab === "train"   && <TrainTab player={player} doTrain={state.doTrain} />}
      {/* ... */}
    </div>
  );
}
```

### `src/App.tsx` update

```ts
// before
import LegacyGame from "./legacy/game";
// after
import GameApp from "./game/GameApp";
```

### Cleanup sequence

1. `game.tsx` should now be empty except for the `LegacyGame` re-export shell
2. Delete `src/legacy/game.tsx`
3. Check legacy types (`LegacyPlayer`, `LegacyItem`, etc.):
   - Still referenced elsewhere → move to `src/legacy/types.ts`
   - No other references → delete
4. `typecheck + npm test` green → final commit

---

## Constraints

- **No behavior changes.** This is purely structural; no logic alterations.
- **No type system improvements** during migration. `any` is acceptable throughout.
- **No handler decomposition** inside `useGameState`. That is a separate future plan.
- **Each task group commits independently.** Rollback granularity is per task group.
- **Verification after each extraction:** `npm run typecheck && npm test` must pass before committing.
