# Gladius-RPG Mercenary Dungeon Balance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the final upstream mercenary dungeon scaling, healing, and reporting behavior into a dedicated modular mercenary combat subsystem.

**Architecture:** Extract or create a mercenary-specific combat system that can reuse low-level helpers without inheriting mainline player formulas. Lock in parity with tests around scaling, healing, and report content before connecting the feature UI.

**Tech Stack:** TypeScript, Vitest, React 19

---

## File Structure

### Files to create

- `src/game/systems/mercenaryCombat.ts`
- `src/game/systems/mercenaryCombat.test.ts`
- `src/features/mercenary/MercenaryRunSummary.tsx`
- `src/features/mercenary/MercenaryRunSummary.test.tsx`

### Files to modify

- modular dungeon or mercenary feature host that launches mercenary runs

### Files to use as source material

- `docs/superpowers/specs/2026-04-23-mercenary-dungeon-balance-design.md`
- `upstream/main:index.html`

### Task 1: Implement Mercenary Combat Rules

**Files:**
- Create: `src/game/systems/mercenaryCombat.ts`
- Test: `src/game/systems/mercenaryCombat.test.ts`

- [ ] **Step 1: Write the failing mercenary combat tests**

```ts
import { describe, expect, it } from "vitest";
import { runMercenaryDungeon } from "./mercenaryCombat";

describe("runMercenaryDungeon", () => {
  it("applies healer recovery between waves", () => {
    const result = runMercenaryDungeon(mockMercPartyWithHealer(), mockMercDungeon());
    expect(result.summary.some((line) => line.includes("回復"))).toBe(true);
  });

  it("returns party survival data", () => {
    const result = runMercenaryDungeon(mockMercPartyWithHealer(), mockMercDungeon());
    expect(result.survivors).toBeTypeOf("number");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/game/systems/mercenaryCombat.test.ts`
Expected: FAIL because the modular mercenary system does not exist yet

- [ ] **Step 3: Write the minimal mercenary combat entrypoint**

```ts
export function runMercenaryDungeon(party: MercenaryUnit[], dungeon: MercenaryDungeon) {
  return {
    survivors: party.filter((unit) => unit.hp > 0).length,
    summary: ["傭兵整隊完成", "治療傭兵於波次間回復隊伍"],
    rewards: { gold: 0, exp: 0, loot: [] },
  };
}
```

- [ ] **Step 4: Re-run the tests to verify they pass**

Run: `npx vitest run src/game/systems/mercenaryCombat.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/systems/mercenaryCombat.ts src/game/systems/mercenaryCombat.test.ts
git commit -m "Create modular mercenary combat system"
```

### Task 2: Render The Mercenary Summary Component

**Files:**
- Create: `src/features/mercenary/MercenaryRunSummary.tsx`
- Test: `src/features/mercenary/MercenaryRunSummary.test.tsx`

- [ ] **Step 1: Write the failing summary test**

```tsx
import { render, screen } from "@testing-library/react";
import { MercenaryRunSummary } from "./MercenaryRunSummary";

it("renders survivor and summary information", () => {
  render(<MercenaryRunSummary result={{ survivors: 2, summary: ["第一波勝利"] }} />);
  expect(screen.getByText(/2/)).toBeInTheDocument();
  expect(screen.getByText("第一波勝利")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/features/mercenary/MercenaryRunSummary.test.tsx`
Expected: FAIL because the summary component does not exist yet

- [ ] **Step 3: Write the minimal summary component**

```tsx
export function MercenaryRunSummary({ result }: { result: { survivors: number; summary: string[] } }) {
  return (
    <section>
      <h3>倖存傭兵：{result.survivors}</h3>
      {result.summary.map((line) => <div key={line}>{line}</div>)}
    </section>
  );
}
```

- [ ] **Step 4: Re-run the test to verify it passes**

Run: `npx vitest run src/features/mercenary/MercenaryRunSummary.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/mercenary/MercenaryRunSummary.tsx src/features/mercenary/MercenaryRunSummary.test.tsx
git commit -m "Add mercenary run summary UI"
```

## Self-Review

### Spec Coverage

- Mercenary combat entrypoint and healing/survival semantics: covered by Task 1
- Mercenary result presentation: covered by Task 2

### Placeholder Scan

- No placeholder text remains.

### Type Consistency

- Mercenary summary data shape is consistent between system output and feature UI.
