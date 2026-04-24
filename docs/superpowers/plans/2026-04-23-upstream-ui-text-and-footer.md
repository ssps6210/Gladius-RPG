# Gladius-RPG Upstream UI Text And Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the final upstream UI copy and coffee footer parity pass once the related modular features are in place.

**Architecture:** Treat this as a dedicated polish plan after tavern, story reward, and feature-shell work already exists. Port exact upstream strings and footer content into their owning modules rather than burying them in unrelated constants.

**Tech Stack:** React 19, TypeScript, Vitest

---

## File Structure

### Files to create

- `src/layout/Footer.tsx`
- `src/layout/Footer.test.tsx`

### Files to modify

- `src/components/StoryModal/StoryModal.tsx`
- `src/features/tavern/TavernPage.tsx`
- app shell that renders the footer

### Files to use as source material

- `docs/superpowers/specs/2026-04-23-upstream-ui-text-and-footer-design.md`
- `upstream/main:index.html`
- `legacy-index.html`

### Task 1: Lock In Tavern Reward Copy

**Files:**
- Modify: `src/components/StoryModal/StoryModal.tsx`
- Test: `src/components/StoryModal/StoryModal.test.tsx`

- [ ] **Step 1: Write the failing copy test**

```tsx
import { render, screen } from "@testing-library/react";
import { StoryModal } from "../components/StoryModal/StoryModal";

it("uses the final upstream heading and confirm text", () => {
  render(<StoryModal story={{ title: "完成", icon: "🏆", conclusion: "結語", reward: { gold: 1, exp: 1 } }} />);
  expect(screen.getByText("QUEST COMPLETE")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "收下賞金，離開酒館" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/StoryModal/StoryModal.test.tsx`
Expected: FAIL if the modal still uses provisional copy

- [ ] **Step 3: Update the modal copy to final upstream wording**

```tsx
<div>QUEST COMPLETE</div>
<button>收下賞金，離開酒館</button>
```

- [ ] **Step 4: Re-run the test to verify it passes**

Run: `npx vitest run src/components/StoryModal/StoryModal.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/StoryModal/StoryModal.tsx src/components/StoryModal/StoryModal.test.tsx
git commit -m "Finalize upstream tavern reward copy"
```

### Task 2: Add The Coffee Footer

**Files:**
- Create: `src/layout/Footer.tsx`
- Test: `src/layout/Footer.test.tsx`
- Modify: app shell or layout root

- [ ] **Step 1: Write the failing footer test**

```tsx
import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

it("renders the coffee footer link", () => {
  render(<Footer />);
  expect(screen.getByRole("link", { name: "☕ Buy the developer a coffee!" })).toHaveAttribute("href", "https://buymeacoffee.com/ssps6210noa");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/layout/Footer.test.tsx`
Expected: FAIL because the footer component does not exist yet

- [ ] **Step 3: Write the minimal footer component**

```tsx
export function Footer() {
  return (
    <footer>
      <a href="https://buymeacoffee.com/ssps6210noa" target="_blank" rel="noreferrer">☕ Buy the developer a coffee!</a>
    </footer>
  );
}
```

- [ ] **Step 4: Re-run the test to verify it passes**

Run: `npx vitest run src/layout/Footer.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/layout/Footer.tsx src/layout/Footer.test.tsx
git commit -m "Add upstream coffee footer"
```

## Self-Review

### Spec Coverage

- Final story reward heading and button copy: covered by Task 1
- Coffee footer link: covered by Task 2

### Placeholder Scan

- No placeholder text remains.

### Type Consistency

- UI copy targets the same story modal and app shell modules introduced by earlier plans.
