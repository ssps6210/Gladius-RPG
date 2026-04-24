# Gladius-RPG Minimal Runnable Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the current `index.html` browser-script runtime into a `Parcel + React 19 + TypeScript` app that stays close to the existing playable feature set and keeps old saves working.

**Architecture:** Build a thin modern app shell first, then port the current monolithic runtime into `src/legacy/game.tsx` with minimal behavior changes. Extract only the highest-value boundaries in phase 1: entrypoint, styles, constants, types, and persistence, while keeping `index.html` as the behavior source of truth.

**Tech Stack:** Parcel 2, React 19, ReactDOM 19, TypeScript 5, browser `localStorage`, optional Vitest for persistence-only tests

---

## File Structure

### Files to create

- `package.json` — project metadata, scripts, and dependencies
- `tsconfig.json` — TypeScript compiler configuration for Parcel + React JSX
- `index.html` — minimal HTML shell with root node and module entry
- `src/main.tsx` — React root bootstrap
- `src/App.tsx` — thin application shell that renders the migrated runtime
- `src/legacy/game.tsx` — migrated gameplay runtime from `index.html`
- `src/game/constants.ts` — storage keys and migration-safe shared constants
- `src/game/types.ts` — initial runtime-safe TypeScript types
- `src/game/persistence.ts` — save/load/clear/migrate wrapper around `localStorage`
- `src/styles/tokens.css` — global design tokens
- `src/styles/globals.css` — reset and document-level styles
- `vitest.config.ts` — test config if persistence tests are added
- `src/game/persistence.test.ts` — compatibility tests for save migration and storage behavior

### Files to modify

- `README.md` — update run/build instructions after the Parcel app works

### Files to use as source material

- `index.html` — authoritative gameplay/runtime behavior
- `App.jsx` — extraction aid when code is easier to read outside the HTML shell
- `docs/superpowers/specs/2026-04-23-minimal-runnable-migration-design.md` — approved design reference

### Files intentionally untouched in phase 1

- `gladius.html`
- `gladiatus-clone.jsx`
- `App (1).jsx`
- `App (2).jsx`
- `App (3).jsx`
- `gladiatus-clone (1).jsx`
- `gladiatus-clone (2).jsx`
- `gladiatus-clone (3).jsx`

## Implementation Notes

- Treat `index.html` as the only behavior authority when the runtime and snapshot files differ.
- Keep save compatibility with `g_pl` and `g_inv` throughout the migration.
- Do not introduce Zustand, Redux, or other state libraries in this plan.
- Do not attempt full CSS Modules conversion in this plan.
- Do not archive or delete legacy files until the new build is verified.

### Task 1: Create The Parcel + React 19 + TypeScript Shell

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles/tokens.css`
- Create: `src/styles/globals.css`

- [ ] **Step 1: Write the failing bootstrap files**

```json
{
  "name": "gladius-rpg",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "dev": "parcel serve index.html",
    "build": "parcel build index.html",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "parcel": "^2.13.3",
    "typescript": "^5.6.3"
  }
}
```

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

```html
<!doctype html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GLADIUS</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./src/main.tsx"></script>
  </body>
</html>
```

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/tokens.css";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

```tsx
export default function App() {
  return (
    <div className="app-shell">
      <div className="loading-shell">
        <div>⚔ GLADIUS ⚔</div>
        <div className="load-bar">
          <div className="load-fill" />
        </div>
        <div className="loading-text">新架構載入中...</div>
      </div>
    </div>
  );
}
```

```css
:root {
  --bg-page: #100c07;
  --bg-panel: #1a120a;
  --bg-panel-2: #2a1a08;
  --text-main: #f3e7c8;
  --text-muted: #bca57a;
  --accent-gold: #c8961e;
  --accent-bronze: #8b5a14;
  --danger: #b93a32;
  --success: #4f8a3f;
  --radius-sm: 6px;
  --radius-md: 10px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --font-display: "Cinzel Decorative", serif;
  --font-heading: "Cinzel", serif;
  --font-body: "Crimson Text", serif;
}
```

```css
html,
body,
#root {
  min-height: 100%;
}

body {
  margin: 0;
  background: var(--bg-page);
  color: var(--text-main);
  font-family: var(--font-body);
}

.app-shell {
  min-height: 100vh;
}

.loading-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: var(--space-4);
  color: var(--accent-gold);
  font-family: var(--font-display);
  letter-spacing: 4px;
}

.load-bar {
  width: 200px;
  height: 3px;
  background: var(--bg-panel-2);
  overflow: hidden;
  border-radius: 999px;
}

.load-fill {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, var(--accent-bronze), var(--accent-gold), var(--accent-bronze));
  background-size: 200% 100%;
  animation: loadAnim 1s linear infinite;
}

.loading-text {
  font-size: 12px;
  color: #5a4020;
  letter-spacing: 2px;
}

@keyframes loadAnim {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}
```

- [ ] **Step 2: Run install to verify dependencies resolve**

Run: `npm install`
Expected: install completes without `ERESOLVE` or missing package errors

- [ ] **Step 3: Run the empty shell to verify the app mounts**

Run: `npm run dev`
Expected: Parcel starts, serves `index.html`, and the browser shows the loading shell without CDN React or Babel errors

- [ ] **Step 4: Run typecheck and build**

Run: `npm run typecheck && npm run build`
Expected: both commands pass and Parcel emits a production build

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json index.html src/main.tsx src/App.tsx src/styles/tokens.css src/styles/globals.css
git commit -m "Add Parcel React TypeScript app shell"
```

### Task 2: Add Persistence Boundary And Runtime Types

**Files:**
- Create: `src/game/constants.ts`
- Create: `src/game/types.ts`
- Create: `src/game/persistence.ts`
- Modify: `src/App.tsx`
- Test: `src/game/persistence.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Write the failing persistence tests**

```ts
import { beforeEach, describe, expect, it } from "vitest";
import {
  STORAGE_KEYS,
  clearGameState,
  loadGameState,
  migrateGameState,
  saveGameState,
} from "./persistence";

describe("persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads empty defaults when storage is missing", () => {
    expect(loadGameState()).toEqual({ player: null, inventory: [] });
  });

  it("repairs missing player fields during migration", () => {
    localStorage.setItem(
      STORAGE_KEYS.player,
      JSON.stringify({ name: "角鬥士", level: 3, hp: 80, equipment: {} }),
    );

    const state = loadGameState();

    expect(state.player?.gold).toBe(0);
    expect(state.player?.highestLevel).toBe(3);
  });

  it("round-trips player and inventory data", () => {
    saveGameState({
      player: {
        name: "角鬥士",
        level: 2,
        exp: 10,
        expNeeded: 100,
        hp: 90,
        maxHp: 100,
        attack: 12,
        defense: 5,
        speed: 8,
        gold: 50,
        equipment: {},
        trainedAtk: 0,
        trainedDef: 0,
        trainedHp: 0,
        trainedSpd: 0,
        totalKills: 0,
        totalBossKills: 0,
        totalDungeons: 0,
        totalExpeditions: 0,
        totalArenaWins: 0,
        totalGoldEarned: 0,
        totalEnhances: 0,
        totalTrains: 0,
        totalMercRuns: 0,
        highestLevel: 2,
      },
      inventory: [{ uid: "test-1", name: "短劍", type: "weapon" }],
    });

    expect(loadGameState()).toEqual({
      player: expect.objectContaining({ level: 2, gold: 50 }),
      inventory: [expect.objectContaining({ uid: "test-1", name: "短劍" })],
    });
  });

  it("clears both storage keys", () => {
    localStorage.setItem(STORAGE_KEYS.player, "{}");
    localStorage.setItem(STORAGE_KEYS.inventory, "[]");

    clearGameState();

    expect(localStorage.getItem(STORAGE_KEYS.player)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.inventory)).toBeNull();
  });
});
```

- [ ] **Step 2: Add the minimal persistence and type files**

```ts
export const STORAGE_KEYS = {
  player: "g_pl",
  inventory: "g_inv",
  meta: "g_meta",
} as const;
```

```ts
export type EquipmentMap = Record<string, unknown>;

export interface Player {
  name: string;
  level: number;
  exp: number;
  expNeeded: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  gold: number;
  equipment: EquipmentMap;
  trainedAtk: number;
  trainedDef: number;
  trainedHp: number;
  trainedSpd: number;
  totalKills: number;
  totalBossKills: number;
  totalDungeons: number;
  totalExpeditions: number;
  totalArenaWins: number;
  totalGoldEarned: number;
  totalEnhances: number;
  totalTrains: number;
  totalMercRuns: number;
  highestLevel: number;
}

export interface ItemLike {
  uid?: string;
  name?: string;
  type?: string;
  [key: string]: unknown;
}

export interface PersistedGameState {
  player: Player | null;
  inventory: ItemLike[];
}
```

```ts
import { STORAGE_KEYS } from "./constants";
import type { PersistedGameState, Player } from "./types";

export { STORAGE_KEYS };

const defaultPlayerFields: Omit<Player, "name" | "level" | "hp" | "equipment"> = {
  exp: 0,
  expNeeded: 100,
  maxHp: 100,
  attack: 12,
  defense: 5,
  speed: 8,
  gold: 0,
  trainedAtk: 0,
  trainedDef: 0,
  trainedHp: 0,
  trainedSpd: 0,
  totalKills: 0,
  totalBossKills: 0,
  totalDungeons: 0,
  totalExpeditions: 0,
  totalArenaWins: 0,
  totalGoldEarned: 0,
  totalEnhances: 0,
  totalTrains: 0,
  totalMercRuns: 0,
  highestLevel: 1,
};

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function migrateGameState(state: PersistedGameState): PersistedGameState {
  if (!state.player) {
    return {
      player: null,
      inventory: Array.isArray(state.inventory) ? state.inventory : [],
    };
  }

  const level = typeof state.player.level === "number" ? state.player.level : 1;

  return {
    player: {
      name: state.player.name ?? "角鬥士",
      level,
      hp: typeof state.player.hp === "number" ? state.player.hp : 100,
      equipment: state.player.equipment ?? {},
      ...defaultPlayerFields,
      ...state.player,
      highestLevel:
        typeof state.player.highestLevel === "number"
          ? state.player.highestLevel
          : level,
    },
    inventory: Array.isArray(state.inventory) ? state.inventory : [],
  };
}

export function loadGameState(): PersistedGameState {
  const player = parseJson<Player | null>(localStorage.getItem(STORAGE_KEYS.player), null);
  const inventory = parseJson<unknown[]>(localStorage.getItem(STORAGE_KEYS.inventory), []);

  return migrateGameState({
    player,
    inventory,
  });
}

export function saveGameState(state: PersistedGameState) {
  if (state.player) {
    localStorage.setItem(STORAGE_KEYS.player, JSON.stringify(state.player));
  } else {
    localStorage.removeItem(STORAGE_KEYS.player);
  }

  localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(state.inventory));
  localStorage.setItem(
    STORAGE_KEYS.meta,
    JSON.stringify({ version: 1, savedAt: new Date().toISOString() }),
  );
}

export function clearGameState() {
  localStorage.removeItem(STORAGE_KEYS.player);
  localStorage.removeItem(STORAGE_KEYS.inventory);
  localStorage.removeItem(STORAGE_KEYS.meta);
}
```

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
  },
});
```

- [ ] **Step 3: Add test dependencies and run the tests to verify they fail first**

Run: `npm install -D vitest jsdom`
Expected: packages install successfully

Run: `npx vitest run src/game/persistence.test.ts`
Expected: FAIL because `src/game/persistence.test.ts` and persistence modules are not fully wired yet

- [ ] **Step 4: Wire the app shell to the persistence boundary**

```tsx
import LegacyGame from "./legacy/game";

export default function App() {
  return <LegacyGame />;
}
```

- [ ] **Step 5: Run tests, typecheck, and build**

Run: `npx vitest run src/game/persistence.test.ts && npm run typecheck && npm run build`
Expected: all commands pass

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/game/constants.ts src/game/types.ts src/game/persistence.ts src/game/persistence.test.ts vitest.config.ts package.json package-lock.json
git commit -m "Add migration-safe persistence layer"
```

### Task 3: Port The Runtime Into `src/legacy/game.tsx`

**Files:**
- Create: `src/legacy/game.tsx`
- Modify: `src/App.tsx`
- Modify: `index.html`

- [ ] **Step 1: Extract the inline game script from `index.html` into a temporary source file**

Run:

```bash
node -e "const fs=require('fs');const html=fs.readFileSync('index.html','utf8');const start=html.indexOf('<script type=\"text/babel\" data-presets=\"react\">');const end=html.lastIndexOf('</script>');if(start===-1||end===-1)throw new Error('script block not found');const body=html.slice(start+47,end).trimStart();fs.mkdirSync('tmp',{recursive:true});fs.writeFileSync('tmp/legacy-runtime.js',body);"
```

Expected: `tmp/legacy-runtime.js` contains the existing game runtime body from the legacy HTML file

- [ ] **Step 2: Create the initial TSX wrapper around the extracted runtime**

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { clearGameState, loadGameState, saveGameState } from "../game/persistence";

// Paste the contents of tmp/legacy-runtime.js below this line.
// Replace the old React global destructuring line with the import above.
// Keep helper functions and component definitions in the same order during the first pass.

export default App;

export { clearGameState, loadGameState, saveGameState };
```

- [ ] **Step 3: Replace legacy browser-global runtime assumptions**

Apply these exact edits inside `src/legacy/game.tsx` after pasting the runtime:

```tsx
// Delete this line if it exists:
// const { useState, useCallback, useRef, useEffect } = React;

// Replace this mount code if it exists near the bottom:
// ReactDOM.createRoot(document.getElementById('root')).render(<App />);

// With nothing. The root mount now lives in src/main.tsx.
```

Also replace direct storage calls:

```ts
// Replace reads like these:
localStorage.getItem("g_pl")
localStorage.getItem("g_inv")

// With:
loadGameState()

// Replace writes like these:
localStorage.setItem("g_pl", JSON.stringify(player));
localStorage.setItem("g_inv", JSON.stringify(inventory));

// With:
saveGameState({ player, inventory });

// Replace clears like these:
localStorage.removeItem("g_pl");
localStorage.removeItem("g_inv");

// With:
clearGameState();
```

- [ ] **Step 4: Point the app shell to the migrated runtime**

```tsx
import LegacyGame from "./legacy/game";

export default function App() {
  return <LegacyGame />;
}
```

- [ ] **Step 5: Run typecheck and fix the first wave of TS errors with migration-safe annotations only**

Run: `npm run typecheck`
Expected: FAIL on the first run with missing names or implicit `any` errors inside `src/legacy/game.tsx`

Allowed fixes in this step:

```tsx
const [inventory, setInventory] = useState<any[]>([]);
const [lootDrop, setLootDrop] = useState<any | null>(null);
function someHelper(item: any) {
  return item;
}
```

Disallowed fixes in this step:

```tsx
// Do not rewrite whole systems during the first error-fixing pass.
function fightMonster() {
  // rewritten combat engine
}
```

- [ ] **Step 6: Re-run the compiler and build**

Run: `npm run typecheck && npm run build`
Expected: both commands pass with the migrated runtime compiling inside Parcel

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/legacy/game.tsx index.html
git commit -m "Port legacy runtime into React TypeScript app"
```

### Task 4: Restore Global Styling And Loading/UI Parity

**Files:**
- Modify: `src/styles/globals.css`
- Modify: `src/styles/tokens.css`
- Modify: `src/legacy/game.tsx`

- [ ] **Step 1: Move the old document-level loading styles into `globals.css`**

Copy these styles from the current legacy HTML into `src/styles/globals.css`, keeping selectors unchanged where practical:

```css
body { margin: 0; background: #100c07; }
#root { min-height: 100vh; }
#loading {
  display: flex; align-items: center; justify-content: center;
  min-height: 100vh; background: #100c07;
  font-family: 'Cinzel Decorative', serif;
  color: #c8961e; font-size: 20px; letter-spacing: 4px;
  flex-direction: column; gap: 16px;
}
.load-bar {
  width: 200px; height: 3px; background: #2a1a08; border-radius: 2px; overflow: hidden;
}
.load-fill {
  height: 100%; background: linear-gradient(90deg, #8b5a14, #e8c050, #8b5a14);
  background-size: 200% 100%;
  animation: loadAnim 1s linear infinite;
}
@keyframes loadAnim { 0%{background-position:100%} 100%{background-position:-100%} }
```

- [ ] **Step 2: Preserve the old fonts and theme variables in token form**

```css
:root {
  --font-display: "Cinzel Decorative", serif;
  --font-heading: "Cinzel", serif;
  --font-body: "Crimson Text", serif;
  --color-bg: #100c07;
  --color-panel: #2a1a08;
  --color-gold: #c8961e;
  --color-gold-soft: #e8c050;
  --color-bronze: #8b5a14;
}
```

- [ ] **Step 3: Remove any duplicate loading shell from `src/App.tsx` if the legacy runtime now owns startup rendering**

```tsx
import LegacyGame from "./legacy/game";

export default function App() {
  return <LegacyGame />;
}
```

- [ ] **Step 4: Run the app and visually compare startup with the original runtime**

Run: `npm run dev`
Expected: the page loads with the same dark background, gold loading motif, and Traditional Chinese-facing runtime feel as the current `index.html`

- [ ] **Step 5: Commit**

```bash
git add src/styles/globals.css src/styles/tokens.css src/legacy/game.tsx src/App.tsx
git commit -m "Restore legacy loading and global theme styles"
```

### Task 5: Verify Near-Complete Feature Coverage Against The Current Runtime

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Run the migrated app in dev mode**

Run: `npm run dev`
Expected: the app starts locally and loads without console-breaking runtime errors

- [ ] **Step 2: Execute the manual smoke checklist against the migrated runtime**

Use this exact checklist:

```text
1. Load an existing save if available.
2. If no save exists, start with a fresh state and verify the main UI appears.
3. Run one expedition and confirm battle log, reward flow, and state updates.
4. Run one dungeon and confirm the same.
5. Open the inventory, equip or unequip one item, and verify visible stat updates.
6. Buy one item from the shop and sell one item back.
7. If auction exists in the current runtime, open it and perform one bid path or inspection path.
8. Perform one enhancement or one training interaction.
9. Open quests and confirm quest state renders.
10. Open arena and confirm arena interaction renders and executes its main path.
11. Refresh the page and confirm player and inventory state reload.
```

Expected: every listed system is reachable and supports its main path without obvious dead ends

- [ ] **Step 3: Run final build verification**

Run: `npx vitest run src/game/persistence.test.ts && npm run typecheck && npm run build`
Expected: all commands pass

- [ ] **Step 4: Update README instructions for the new runtime**

Replace the current run instructions with this block once the Parcel build is working:

```md
## 🎮 Run Locally

```bash
npm install
npm run dev
```

## 🏗️ Build

```bash
npm run build
```

Legacy note: `index.html` is no longer a standalone Babel runtime entry after the migration. The old standalone files remain in the repository as migration references until cleanup work is complete.
```

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "Document Parcel migration workflow"
```

## Self-Review

### Spec Coverage

- Build skeleton: covered by Task 1
- Whole-file port into `src/legacy/game.tsx`: covered by Task 3
- Persistence compatibility for `g_pl` and `g_inv`: covered by Task 2 and Task 5
- Near-complete runtime parity verification: covered by Task 5
- Minimal cleanup only, no broad rewrite: enforced in Task 3 and Task 4
- Preserve existing visual identity: covered by Task 4

No uncovered spec requirement remains for the phase 1 migration plan.

### Placeholder Scan

- Removed placeholder-style language from tasks.
- Every task has explicit files and concrete commands.
- The only manual area is the monolith port itself, and the plan pins it to exact source files, exact extraction command, and exact replacement targets.

### Type Consistency

- Storage keys are consistently named through `STORAGE_KEYS.player`, `STORAGE_KEYS.inventory`, and `STORAGE_KEYS.meta`.
- Persistence API is consistently named `loadGameState`, `saveGameState`, `clearGameState`, and `migrateGameState`.
- Runtime host file is consistently named `src/legacy/game.tsx`.
