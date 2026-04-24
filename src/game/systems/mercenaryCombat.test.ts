import { describe, expect, it } from "vitest";
import { runMercenaryDungeon } from "./mercenaryCombat";

function mockMercPartyWithHealer() {
  return [
    { name: "盾衛", icon: "🛡️", attack: 8, defense: 12, hp: 120, maxHp: 120 },
    { name: "治癒師", icon: "🧝", attack: 2, defense: 4, hp: 60, maxHp: 60, heal: 10 },
  ];
}

function mockMercDungeon() {
  return {
    id: "test-dungeon",
    label: "測試地下城",
    icon: "🏰",
    lore: "測試",
    lvBonus: 0,
    waves: [
      { enemies: ["wolf"], desc: "第一波：狼群", mult: 1 },
    ],
    reward: { expMult: 1, goldMult: 1, scrollBonus: 0 },
  };
}

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
