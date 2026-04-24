# Final Legacy Surface Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove `src/legacy/` completely, migrate its remaining code into canonical `src/game/` locations, eliminate the `Legacy*` type names from active code, preserve the docs in git, and finish with clean local verification.

**Architecture:** Keep runtime behavior stable by moving the existing loose compatibility surface instead of redesigning it. Rename the exported app-facing types in one small type-module cutover, relocate the active stylesheet without changing its contents, move the stray test next to the module it covers, then delete `src/legacy/` and re-run clean verification after removing the stale worktree.

**Tech Stack:** React 19, TypeScript, Vitest, Parcel, git worktrees

---

## File Structure

- Create: `src/game/appTypes.ts`
  - Canonical home for the wide app-facing entity types previously exported from `src/legacy/types.ts`
- Create: `src/game/lib/display.test.ts`
  - Canonical home for the train stat display mapping test currently mislocated in `src/legacy/game.test.ts`
- Move: `src/legacy/game.css` -> `src/game/game.css`
  - Canonical home for the active game stylesheet
- Modify: `src/game/GameApp.tsx`
  - Rewire stylesheet import
- Modify: `src/game/useGameState.ts`
  - Rewire type imports and rename local state annotations to `Game*`
- Modify: `src/features/quests/QuestTab.tsx`
  - Rewire app-facing item/player/quest types
- Modify: `src/features/arena/ArenaTab.tsx`
  - Rewire app-facing player/opponent types
- Modify: `src/features/battle/BattleReport.tsx`
  - Rewire replay type
- Delete: `src/legacy/types.ts`
- Delete: `src/legacy/game.css`
- Delete: `src/legacy/game.test.ts`
- Delete: `src/legacy/`

### Task 1: Move the misplaced display test first

**Files:**
- Create: `src/game/lib/display.test.ts`
- Delete: `src/legacy/game.test.ts`
- Test: `src/game/lib/display.test.ts`

- [ ] **Step 1: Write the failing test at the new canonical location**

Create `src/game/lib/display.test.ts` with this exact content:

```ts
import { describe, expect, it } from "vitest";

import { TRAIN_STAT_DISPLAY_KEYS } from "./display";

describe("train stat display mapping", () => {
  it("uses concrete player stat keys instead of derived abbreviations", () => {
    expect(TRAIN_STAT_DISPLAY_KEYS.trainedAtk).toBe("attack");
    expect(TRAIN_STAT_DISPLAY_KEYS.trainedDef).toBe("defense");
    expect(TRAIN_STAT_DISPLAY_KEYS.trainedSpd).toBe("speed");
    expect(TRAIN_STAT_DISPLAY_KEYS).not.toHaveProperty("trainedHp");
  });
});
```

- [ ] **Step 2: Run the new test to verify it passes before removing the old file**

Run: `npm test -- src/game/lib/display.test.ts`
Expected: PASS for 1 test in `src/game/lib/display.test.ts`

- [ ] **Step 3: Delete the misplaced legacy-path test**

Delete `src/legacy/game.test.ts` after the new file is green.

- [ ] **Step 4: Re-run the focused test to confirm coverage still exists only in the new location**

Run: `npm test -- src/game/lib/display.test.ts`
Expected: PASS for the same 1 test

### Task 2: Create the canonical app type module and rename exported types

**Files:**
- Create: `src/game/appTypes.ts`
- Delete: `src/legacy/types.ts`
- Test: `npm run typecheck`

- [ ] **Step 1: Write the new app type module with stable names**

Create `src/game/appTypes.ts` with this exact content:

```ts
import type {
  RuntimeArenaOpponent,
  RuntimeItem,
  RuntimePlayer,
  RuntimeQuestState,
  RuntimeReplay,
} from "./types";

export type AnyRecord = Record<string, any>;
export type AnyList = any[];

export type GameItem = RuntimeItem & AnyRecord & {
  uid: any;
  name: any;
  icon: any;
  rarity: any;
  cat: any;
  attack: any;
  defense: any;
  hp: any;
  speed: any;
  heal: any;
  enhLv: any;
  itemLevel: any;
  slot: any;
  type: any;
  cost: any;
  affixes: any[];
  specials: any[];
};

export type GamePlayer = RuntimePlayer & AnyRecord & {
  level: any;
  exp: any;
  expNeeded: any;
  hp: any;
  maxHp: any;
  attack: any;
  defense: any;
  speed: any;
  gold: any;
  equipment: AnyRecord;
};

export type GameQuestState = RuntimeQuestState & AnyRecord;

export type GameArenaOpponent = Omit<RuntimeArenaOpponent, "equipment"> & AnyRecord & {
  equipment: AnyRecord;
  attack: any;
  defense: any;
  maxHp: any;
  hp: any;
  goldCarried: any;
};

export type GameReplay = Omit<RuntimeReplay, "drops" | "dungeon" | "tier" | "expedition" | "opponent"> & AnyRecord & {
  lines: any[];
  cursor: any;
  drops: GameItem[];
  won?: any;
  dungeon?: any;
  tier?: any;
  expedition?: any;
  opponent?: any;
};

export type LootDrop = GameItem & { _remaining?: GameItem[] };
```

- [ ] **Step 2: Run typecheck to verify the new module is syntactically valid before rewiring imports**

Run: `npm run typecheck`
Expected: FAIL because active files still import `../legacy/types`, not because `src/game/appTypes.ts` is invalid

- [ ] **Step 3: Delete the old legacy type module after the new module exists**

Delete `src/legacy/types.ts` only after the new canonical file is present.

### Task 3: Rewire all active imports from `Legacy*` to `Game*`

**Files:**
- Modify: `src/game/useGameState.ts`
- Modify: `src/features/quests/QuestTab.tsx`
- Modify: `src/features/arena/ArenaTab.tsx`
- Modify: `src/features/battle/BattleReport.tsx`
- Test: `npm run typecheck`

- [ ] **Step 1: Update `src/game/useGameState.ts` imports and state annotations**

Change the type import block from:

```ts
import type {
  AnyRecord,
  LegacyArenaOpponent,
  LegacyItem,
  LegacyPlayer,
  LegacyQuestState,
  LegacyReplay,
  LootDrop,
} from "../legacy/types";
```

to:

```ts
import type {
  AnyRecord,
  GameArenaOpponent,
  GameItem,
  GamePlayer,
  GameQuestState,
  GameReplay,
  LootDrop,
} from "./appTypes";
```

Then rename these annotations exactly:

```ts
const [player, setPlayer] = useState<GamePlayer>(() => loadGameState().player as GamePlayer);
const [inventory, setInventory] = useState<GameItem[]>(() => loadGameState().inventory as GameItem[]);
const [replay, setReplay] = useState<GameReplay | null>(null);
const [arenaOpponents, setArenaOpponents] = useState<GameArenaOpponent[]>([]);
const [questState, setQuestState] = useState<GameQuestState>(() => initQuestState());
```

And update the casts:

```ts
drops: result.drops as GameItem[]
```

```ts
} as GameReplay
```

```ts
setArenaOpponents(Array.from({ length: 4 }, () => genArenaOpponent(player.level)) as GameArenaOpponent[]);
```

- [ ] **Step 2: Update `src/features/quests/QuestTab.tsx` to use canonical game type names**

Change:

```ts
import type { LegacyItem, LegacyPlayer, LegacyQuestState } from "../../legacy/types";
```

to:

```ts
import type { GameItem, GamePlayer, GameQuestState } from "../../game/appTypes";
```

And change props to:

```ts
  player: GamePlayer;
  inventory: GameItem[];
  questState: GameQuestState;
```

- [ ] **Step 3: Update `src/features/arena/ArenaTab.tsx` to use canonical game type names**

Change:

```ts
import type { LegacyArenaOpponent, LegacyPlayer } from "../../legacy/types";
```

to:

```ts
import type { GameArenaOpponent, GamePlayer } from "../../game/appTypes";
```

And change props to:

```ts
  player: GamePlayer;
  arenaOpponents: GameArenaOpponent[];
  onFight: (opponent: GameArenaOpponent) => void;
```

- [ ] **Step 4: Update `src/features/battle/BattleReport.tsx` to use canonical replay naming**

Change:

```ts
import type { LegacyReplay } from "../../legacy/types";
```

to:

```ts
import type { GameReplay } from "../../game/appTypes";
```

And change:

```ts
  replay: LegacyReplay | null;
```

to:

```ts
  replay: GameReplay | null;
```

- [ ] **Step 5: Run typecheck to verify there are no remaining import or type-name errors**

Run: `npm run typecheck`
Expected: PASS

### Task 4: Move the active stylesheet out of `src/legacy/`

**Files:**
- Create: `src/game/game.css`
- Modify: `src/game/GameApp.tsx`
- Delete: `src/legacy/game.css`
- Test: `npm run build`

- [ ] **Step 1: Copy the stylesheet into its canonical runtime location**

Create `src/game/game.css` by copying the full existing contents of `src/legacy/game.css` without stylistic changes.

- [ ] **Step 2: Update `src/game/GameApp.tsx` to import the new path**

Change line 1 from:

```ts
import "../legacy/game.css";
```

to:

```ts
import "./game.css";
```

- [ ] **Step 3: Run the build before deleting the old stylesheet**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Delete `src/legacy/game.css` after the new import is proven**

Delete the old stylesheet file.

### Task 5: Delete `src/legacy/`, remove stale worktree, and perform final clean verification

**Files:**
- Delete: `src/legacy/`
- External cleanup: `/home/evans/Projects/Public/Gladius-RPG/.worktrees/legacy-logic-extraction`
- Test: full repo verification commands

- [ ] **Step 1: Verify no active imports or `Legacy*` names remain before directory deletion**

Run: `rg "legacy/|LegacyItem|LegacyPlayer|LegacyQuestState|LegacyArenaOpponent|LegacyReplay" src`
Expected: no matches in active app code

- [ ] **Step 2: Delete the now-empty `src/legacy/` directory**

Remove the directory only after the previous grep is clean.

- [ ] **Step 3: Remove the stale worktree that pollutes Vitest discovery**

Run: `git worktree remove "/home/evans/Projects/Public/Gladius-RPG/.worktrees/legacy-logic-extraction"`
Expected: worktree removed successfully

- [ ] **Step 4: Verify the worktree list is now clean enough for main-only testing**

Run: `git worktree list`
Expected: no entry for `.worktrees/legacy-logic-extraction`

- [ ] **Step 5: Run the full typecheck on the cleaned workspace**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 6: Run the full test suite on the cleaned workspace**

Run: `npm test`
Expected: PASS, with no test files discovered from `.worktrees/legacy-logic-extraction`

- [ ] **Step 7: Run the production build on the cleaned workspace**

Run: `npm run build`
Expected: PASS

- [ ] **Step 8: Confirm the final structural goal is met**

Run: `git status --short --branch`
Expected:
- `src/legacy/` no longer exists
- the docs remain available to stage/commit
- no push has been performed
