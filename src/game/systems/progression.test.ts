import { describe, expect, it } from "vitest";
import { applyProgressionRewards } from "./progression";

describe("applyProgressionRewards", () => {
  it("fully heals on level up", () => {
    const result = applyProgressionRewards(
      { level: 1, exp: 95, expNeeded: 100, hp: 12, maxHp: 100, highestLevel: 1 },
      { exp: 10, gold: 0 },
    );

    expect(result.player.level).toBe(2);
    expect(result.player.hp).toBe(result.player.maxHp);
  });

  it("updates highestLevel when leveling", () => {
    const result = applyProgressionRewards(
      { level: 2, exp: 95, expNeeded: 100, hp: 40, maxHp: 110, highestLevel: 2 },
      { exp: 20, gold: 0 },
    );

    expect(result.player.highestLevel).toBe(3);
  });
});
