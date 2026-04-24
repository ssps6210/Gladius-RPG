# Gladius-RPG Tavern Bounties And Story Rewards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the upstream tavern bounty board, bounty progression, and story reward flow to the modular tavern feature.

**Architecture:** Move authored bounty content into data, implement board and progression logic in `src/game/systems/tavernQuests.ts`, then surface it through tavern UI and a dedicated story reward modal.

**Tech Stack:** React 19, TypeScript, Vitest

---

## File Structure

### Files to create

- `src/game/data/tavernQuests.ts`
- `src/game/systems/tavernQuests.ts`
- `src/game/systems/tavernQuests.test.ts`
- `src/components/StoryModal/StoryModal.tsx`
- `src/components/StoryModal/StoryModal.test.tsx`

### Files to modify

- `src/features/tavern/TavernPage.tsx`
- `src/features/tavern/` child components for board and active quest rendering

### Files to use as source material

- `docs/superpowers/specs/2026-04-23-tavern-bounties-and-story-rewards-design.md`
- `upstream/main:index.html`

### Task 1: Encode Tavern Quest Data And Progression Rules

**Files:**
- Create: `src/game/data/tavernQuests.ts`
- Create: `src/game/systems/tavernQuests.ts`
- Test: `src/game/systems/tavernQuests.test.ts`

- [ ] **Step 1: Write the failing tavern quest tests**

```ts
import { describe, expect, it } from "vitest";
import { applyTavernKillProgress, claimTavernQuestReward } from "./tavernQuests";

describe("tavern quests", () => {
  it("increments progress from structured kill records", () => {
    const state = applyTavernKillProgress(mockActiveQuestState(), [{ enemyId: "wolf", enemyName: "餓狼", count: 2 }]);
    expect(state.progress.wolf).toBe(2);
  });

  it("creates story reward state when claiming a completed quest", () => {
    const result = claimTavernQuestReward(mockCompletedQuestState());
    expect(result.storyReward?.title).toBeTruthy();
    expect(result.storyReward?.conclusion).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/game/systems/tavernQuests.test.ts`
Expected: FAIL because tavern quest system modules do not exist yet

- [ ] **Step 3: Write the minimal tavern quest system**

```ts
export function applyTavernKillProgress(state: TavernQuestState, kills: KillRecord[]) {
  const progress = { ...state.progress };
  for (const kill of kills) progress[kill.enemyId] = (progress[kill.enemyId] ?? 0) + kill.count;
  return { ...state, progress };
}
```

- [ ] **Step 4: Re-run the tests to verify they pass**

Run: `npx vitest run src/game/systems/tavernQuests.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/data/tavernQuests.ts src/game/systems/tavernQuests.ts src/game/systems/tavernQuests.test.ts
git commit -m "Add tavern bounty data and progression rules"
```

### Task 2: Render The Story Reward Modal

**Files:**
- Create: `src/components/StoryModal/StoryModal.tsx`
- Test: `src/components/StoryModal/StoryModal.test.tsx`
- Modify: `src/features/tavern/TavernPage.tsx`

- [ ] **Step 1: Write the failing modal test**

```tsx
import { render, screen } from "@testing-library/react";
import { StoryModal } from "./StoryModal";

it("renders the upstream heading and action text", () => {
  render(<StoryModal story={{ title: "討伐完成", icon: "🗡", conclusion: "故事結尾", reward: { gold: 10, exp: 20 } }} />);
  expect(screen.getByText("QUEST COMPLETE")).toBeInTheDocument();
  expect(screen.getByText("收下賞金，離開酒館")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/StoryModal/StoryModal.test.tsx`
Expected: FAIL because the story modal does not exist yet

- [ ] **Step 3: Write the minimal modal implementation**

```tsx
export function StoryModal({ story }: { story: StoryRewardState }) {
  return (
    <dialog open>
      <div>QUEST COMPLETE</div>
      <h3>{story.icon} {story.title}</h3>
      <p>{story.conclusion}</p>
      <button>收下賞金，離開酒館</button>
    </dialog>
  );
}
```

- [ ] **Step 4: Re-run the test to verify it passes**

Run: `npx vitest run src/components/StoryModal/StoryModal.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/StoryModal/StoryModal.tsx src/components/StoryModal/StoryModal.test.tsx src/features/tavern/TavernPage.tsx
git commit -m "Add tavern story reward modal"
```

## Self-Review

### Spec Coverage

- Tavern bounty progression from structured kills: covered by Task 1
- Story reward modal and upstream completion copy: covered by Task 2

### Placeholder Scan

- No placeholder text remains.

### Type Consistency

- Uses `KillRecord`, `TavernQuestState`, and `StoryRewardState` consistently with earlier plans.
