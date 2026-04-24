import { describe, expect, it } from "vitest";

import { applyEnhanceBonus, calcSellPrice, enhanceCost } from "./items";

describe("item helpers", () => {
  it("applies enhancement bonuses cumulatively from each prior level", () => {
    const enhanced = applyEnhanceBonus({
      attack: 1,
      defense: 1,
      hp: 1,
      speed: 1,
      baseAttack: 100,
      baseDefense: 80,
      baseHp: 120,
      baseSpeed: 50,
      enhLv: 3,
    });

    expect(enhanced.attack).toBe(126);
    expect(enhanced.defense).toBe(100);
    expect(enhanced.hp).toBe(151);
    expect(enhanced.speed).toBe(63);
  });

  it("prices mercenary scrolls from rarity", () => {
    expect(calcSellPrice({ type: "merc_scroll", rarity: "legendary" })).toBe(450);
  });

  it("returns a positive enhancement cost for a normal +1 item", () => {
    const cost = enhanceCost({
      rarity: "normal",
      attack: 10,
      defense: 0,
      hp: 0,
      speed: 0,
      itemLevel: 1,
      enhLv: 1,
    });

    expect(cost).toBeGreaterThan(0);
  });
});
