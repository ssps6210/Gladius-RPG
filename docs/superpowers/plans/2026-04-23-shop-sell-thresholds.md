# Gladius-RPG Shop Sell Thresholds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add upstream rarity-threshold bulk selling to the modular economy, shop, and inventory flows.

**Architecture:** Implement threshold comparison and protected-item filtering inside the economy system first, then render shared threshold controls in shop and inventory UI.

**Tech Stack:** TypeScript, React 19, Vitest

---

## File Structure

### Files to create

- `src/features/shop/SellThresholdControl.tsx`
- `src/features/shop/SellThresholdControl.test.tsx`

### Files to modify

- `src/game/data/rarities.ts`
- `src/game/systems/economy.ts`
- `src/features/shop/ShopTab.tsx`
- `src/features/inventory/InventoryTab.tsx`

### Files to use as source material

- `docs/superpowers/specs/2026-04-23-shop-sell-thresholds-design.md`
- `upstream/main:index.html`

### Task 1: Implement Threshold-Based Economy Filtering

**Files:**
- Modify: `src/game/systems/economy.ts`
- Test: `src/game/systems/economy.test.ts`

- [ ] **Step 1: Write the failing economy tests**

```ts
import { describe, expect, it } from "vitest";
import { getBulkSellResult } from "./economy";

describe("getBulkSellResult", () => {
  it("includes items up to the selected threshold", () => {
    const result = getBulkSellResult(mockInventory(), mockEquipment(), "rare");
    expect(result.items.every((item) => ["normal", "magic", "rare"].includes(item.rarity))).toBe(true);
  });

  it("excludes equipped and protected items", () => {
    const result = getBulkSellResult(mockInventory(), mockEquipment(), "legendary");
    expect(result.items.some((item) => item.uid === "equipped-sword")).toBe(false);
    expect(result.items.some((item) => item.type === "merc_scroll")).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/game/systems/economy.test.ts`
Expected: FAIL because threshold-based filtering does not exist yet

- [ ] **Step 3: Implement the minimal economy helper**

```ts
export function getBulkSellResult(inventory: ItemLike[], equipment: EquipmentMap, threshold: ItemRarity) {
  const cutoff = getRarityRank(threshold);
  const equipped = new Set(Object.values(equipment).filter(Boolean).map((item: any) => item.uid));
  const items = inventory.filter((item) => getRarityRank(item.rarity) <= cutoff && !equipped.has(item.uid) && item.type !== "merc_scroll" && item.type !== "potion");
  return { items, gold: items.reduce((sum, item) => sum + calcSellPrice(item), 0) };
}
```

- [ ] **Step 4: Re-run the tests to verify they pass**

Run: `npx vitest run src/game/systems/economy.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/systems/economy.ts src/game/systems/economy.test.ts src/game/data/rarities.ts
git commit -m "Add rarity-threshold bulk sell filtering"
```

### Task 2: Render The Threshold Selector Control

**Files:**
- Create: `src/features/shop/SellThresholdControl.tsx`
- Test: `src/features/shop/SellThresholdControl.test.tsx`
- Modify: `src/features/shop/ShopTab.tsx`
- Modify: `src/features/inventory/InventoryTab.tsx`

- [ ] **Step 1: Write the failing component test**

```tsx
import { render, screen } from "@testing-library/react";
import { SellThresholdControl } from "./SellThresholdControl";

it("renders the upstream bulk sell action text", () => {
  render(<SellThresholdControl value="normal" onChange={() => {}} onSell={() => {}} />);
  expect(screen.getByText("🗑 一鍵賣出")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/features/shop/SellThresholdControl.test.tsx`
Expected: FAIL because the shared control does not exist yet

- [ ] **Step 3: Write the minimal shared control**

```tsx
export function SellThresholdControl({ value, onChange, onSell }: SellThresholdControlProps) {
  return (
    <div>
      <select value={value} onChange={(event) => onChange(event.target.value as ItemRarity)}>
        <option value="normal">⬜ 普通以下</option>
        <option value="magic">🟢 魔法以下</option>
        <option value="rare">🔵 稀有以下</option>
        <option value="legendary">🟣 傳說以下</option>
      </select>
      <button onClick={onSell}>🗑 一鍵賣出</button>
    </div>
  );
}
```

- [ ] **Step 4: Re-run the test to verify it passes**

Run: `npx vitest run src/features/shop/SellThresholdControl.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/shop/SellThresholdControl.tsx src/features/shop/SellThresholdControl.test.tsx src/features/shop/ShopTab.tsx src/features/inventory/InventoryTab.tsx
git commit -m "Add shop bulk sell threshold controls"
```

## Self-Review

### Spec Coverage

- Threshold-based filtering and protected-item exclusion: covered by Task 1
- Shared selector UI and upstream action text: covered by Task 2

### Placeholder Scan

- No placeholder text remains.

### Type Consistency

- Uses `ItemRarity` and equipment/inventory inputs consistently with the modular economy layer.
