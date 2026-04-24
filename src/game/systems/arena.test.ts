import { afterEach, describe, expect, it, vi } from "vitest";

const { genLootMock } = vi.hoisted(() => ({
  genLootMock: vi.fn(),
}));

vi.mock("./loot", () => ({
  genLoot: genLootMock,
}));

import { genArenaOpponent } from "./arena";

function mockRandomSequence(values: number[]) {
  let index = 0;

  return vi.spyOn(Math, "random").mockImplementation(() => {
    const value = values[index];
    index += 1;
    return value ?? 0;
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("arena system", () => {
  it("generates arena opponents with the legacy shape and derived stats", () => {
    genLootMock.mockImplementation((itemLevel, _bonus, slot) => {
      const statBySlot = {
        offhand: { attack: 2, defense: 5, hp: 7 },
        armor: { attack: 0, defense: 8, hp: 10 },
        gloves: { attack: 4, defense: 1, hp: 0 },
        ring: { attack: 3, defense: 0, hp: 6 },
      } as const;

      return {
        slot,
        type: slot,
        rarity: "normal",
        itemLevel,
        ...(statBySlot[slot as keyof typeof statBySlot] ?? { attack: 0, defense: 0, hp: 0 }),
      };
    });

    vi.spyOn(Date, "now").mockReturnValue(5000);
    mockRandomSequence([
      0, 0, 0,
      0.9,
      0.5,
      0,
      0.9, 0, 0, 0.8, 0, 0.8, 0, 0.8,
      0.25,
      0.25,
      0.4,
      0.6,
      0.8,
    ]);

    const opponent = genArenaOpponent(10);

    expect(opponent).toMatchObject({
      id: 5000.4,
      name: "不敗的鐵拳戰士",
      title: "不敗的",
      level: 13,
      tier: "normal",
      attack: 36,
      defense: 26,
      maxHp: 230,
      hp: 230,
      goldCarried: 358,
      equipment: {
        weapon: null,
        offhand: expect.objectContaining({ slot: "offhand", type: "offhand", rarity: "normal", itemLevel: 13 }),
        armor: expect.objectContaining({ slot: "armor", type: "armor", rarity: "normal", itemLevel: 13 }),
        helmet: null,
        gloves: expect.objectContaining({ slot: "gloves", type: "gloves", rarity: "normal", itemLevel: 13 }),
        boots: null,
        ring: expect.objectContaining({ slot: "ring", type: "ring", rarity: "normal", itemLevel: 13 }),
        amulet: null,
      },
      wcKey: "axe",
      wins: 18,
      losses: 12,
    });

    expect(genLootMock).toHaveBeenCalledTimes(4);
    expect(genLootMock).toHaveBeenNthCalledWith(1, 13, 0.31, "offhand");
    expect(genLootMock).toHaveBeenNthCalledWith(2, 13, 0.31, "armor");
    expect(genLootMock).toHaveBeenNthCalledWith(3, 13, 0.31, "gloves");
    expect(genLootMock).toHaveBeenNthCalledWith(4, 13, 0.31, "ring");
  });
});
