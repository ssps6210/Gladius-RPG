import { describe, expect, it } from "vitest";
import { getBulkSellResult } from "./economy";

function makeItem(uid: string, rarity: string, type = "armor") {
  return { uid, rarity, type, itemLevel: 5, cost: 100, name: "item" };
}

function mockInventory() {
  return [
    makeItem("item-normal", "normal"),
    makeItem("item-magic", "magic"),
    makeItem("item-rare", "rare"),
    makeItem("item-legendary", "legendary"),
    makeItem("item-mythic", "mythic"),
    makeItem("item-scroll", "rare", "merc_scroll"),
  ];
}

function mockEquipment() {
  return {
    weapon: makeItem("equipped-sword", "rare"),
    offhand: null,
    helmet: null,
    armor: null,
    gloves: null,
    boots: null,
    ring: null,
    amulet: null,
  };
}

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
