# Gladius-RPG Tavern And Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the upstream tavern tab, inn panel, and injury recovery flow to the modular app.

**Architecture:** Build recovery rules in `src/game/systems/recovery.ts` first, then surface them through a tavern feature container and whichever layout shell owns the primary navigation. Persist injury timestamps if the app persists them elsewhere.

**Tech Stack:** React 19, TypeScript, Vitest, localStorage persistence wrappers

---

## File Structure

### Files to create

- `src/game/systems/recovery.ts`
- `src/game/systems/recovery.test.ts`
- `src/features/tavern/TavernPage.tsx`
- `src/features/tavern/InnPanel.tsx`
- `src/features/tavern/TavernPage.test.tsx`

### Files to modify

- app navigation shell that renders top-level tabs
- persistence files if recovery timestamps are saved

### Files to use as source material

- `docs/superpowers/specs/2026-04-23-tavern-and-recovery-design.md`
- `upstream/main:index.html`

### Task 1: Implement Recovery Rules

**Files:**
- Create: `src/game/systems/recovery.ts`
- Test: `src/game/systems/recovery.test.ts`

- [ ] **Step 1: Write the failing recovery tests**

```ts
import { describe, expect, it } from "vitest";
import { applyInnRest, getRecoveryStatus, maybeClearDungeonInjury } from "./recovery";

describe("recovery", () => {
  it("reports injury while dungeon cooldown is active", () => {
    const status = getRecoveryStatus({ dungeonInjuredUntil: Date.now() + 60_000, arenaInjuredUntil: 0 }, Date.now(), 50, 100);
    expect(status.dungeonInjured).toBe(true);
  });

  it("inn rest fully heals and clears both injuries", () => {
    const result = applyInnRest({ hp: 12, maxHp: 100 }, { dungeonInjuredUntil: 10, arenaInjuredUntil: 20 });
    expect(result.player.hp).toBe(100);
    expect(result.recovery.dungeonInjuredUntil).toBe(0);
    expect(result.recovery.arenaInjuredUntil).toBe(0);
  });

  it("auto-clears dungeon injury when hp reaches max", () => {
    const result = maybeClearDungeonInjury({ dungeonInjuredUntil: 1000, arenaInjuredUntil: 0 }, 100, 100);
    expect(result.dungeonInjuredUntil).toBe(0);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/game/systems/recovery.test.ts`
Expected: FAIL because recovery helpers do not exist yet

- [ ] **Step 3: Write the minimal recovery helpers**

```ts
export function applyInnRest(player: { hp: number; maxHp: number }, recovery: RecoveryState) {
  return {
    player: { ...player, hp: player.maxHp },
    recovery: { ...recovery, dungeonInjuredUntil: 0, arenaInjuredUntil: 0 },
  };
}
```

- [ ] **Step 4: Re-run the tests to verify they pass**

Run: `npx vitest run src/game/systems/recovery.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/systems/recovery.ts src/game/systems/recovery.test.ts
git commit -m "Add upstream tavern recovery rules"
```

### Task 2: Render The Tavern Tab And Inn Panel

**Files:**
- Create: `src/features/tavern/TavernPage.tsx`
- Create: `src/features/tavern/InnPanel.tsx`
- Test: `src/features/tavern/TavernPage.test.tsx`
- Modify: top-level navigation shell

- [ ] **Step 1: Write the failing component test**

```tsx
import { render, screen } from "@testing-library/react";
import { TavernPage } from "./TavernPage";

it("renders the inn panel and recovery copy", () => {
  render(<TavernPage player={{ hp: 40, maxHp: 100 }} recovery={{ dungeonInjuredUntil: Date.now() + 60_000, arenaInjuredUntil: 0 }} />);
  expect(screen.getByText("酒館旅店")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/features/tavern/TavernPage.test.tsx`
Expected: FAIL because the tavern feature components do not exist yet

- [ ] **Step 3: Write the minimal tavern page shell**

```tsx
export function TavernPage({ player, recovery }: TavernPageProps) {
  return (
    <section>
      <h2>🍺 酒館</h2>
      <InnPanel player={player} recovery={recovery} />
    </section>
  );
}
```

- [ ] **Step 4: Re-run the test to verify it passes**

Run: `npx vitest run src/features/tavern/TavernPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/tavern/TavernPage.tsx src/features/tavern/InnPanel.tsx src/features/tavern/TavernPage.test.tsx
git commit -m "Add tavern page and inn panel"
```

## Self-Review

### Spec Coverage

- Recovery timestamps and inn rest semantics: covered by Task 1
- Tavern tab and inn UI shell: covered by Task 2

### Placeholder Scan

- No placeholder text remains.

### Type Consistency

- Recovery state names match the spec: `dungeonInjuredUntil`, `arenaInjuredUntil`
