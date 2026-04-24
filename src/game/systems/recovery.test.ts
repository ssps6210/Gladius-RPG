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
