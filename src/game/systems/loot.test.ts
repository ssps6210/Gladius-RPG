import { afterEach, describe, expect, it, vi } from "vitest";

import { ALL_BASE_ITEMS } from "../data/itemBases";
import {
  buildName,
  genAuctionItem,
  genLoot,
  genMercScroll,
  genShopItem,
  getRarity,
  itemLevelScale,
  rollAffixes,
  rollRarity,
} from "./loot";

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

describe("loot system", () => {
  it("returns known rarities and falls back to normal", () => {
    expect(getRarity("legendary").id).toBe("legendary");
    expect(getRarity("missing").id).toBe("normal");
  });

  it("scales item levels by ten-level tiers", () => {
    expect(itemLevelScale(1)).toBe(1);
    expect(itemLevelScale(10)).toBe(1.25);
    expect(itemLevelScale(20)).toBe(1.5625);
  });

  it("rolls rarities against adjusted weights", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);

    expect(rollRarity().id).toBe("mythic");
  });

  it("rolls unique affixes for the requested slot", () => {
    mockRandomSequence([0, 0, 0, 0, 0, 0]);

    const affixes = rollAffixes("weapon", getRarity("rare"), 5);

    expect(affixes).toHaveLength(2);
    expect(new Set(affixes.map((affix: any) => affix.id)).size).toBe(2);
    expect(affixes.every((affix: any) => affix.slots.includes("weapon"))).toBe(true);
  });

  it("builds mythic names with prefix and suffix tags", () => {
    const base = ALL_BASE_ITEMS.find((item) => item.name === "短劍");
    expect(base).toBeTruthy();

    const name = buildName(base, getRarity("mythic"), [
      { type: "prefix", tag: "鋒利" },
      { type: "suffix", tag: "爆擊" },
    ]);

    expect(name).toBe("【神話】鋒利短劍之爆擊");
  });

  it("generates normal loot for a forced slot", () => {
    vi.spyOn(Date, "now").mockReturnValue(1000);
    mockRandomSequence([0, 0]);

    const item = genLoot(1, 0, "weapon");

    expect(item.slot).toBe("weapon");
    expect(item.type).toBe("weapon");
    expect(item.itemLevel).toBe(1);
    expect(item.rarity).toBe("normal");
    expect(item.affixes).toEqual([]);
    expect(item.specials).toEqual([]);
    expect(item.uid).toBe(1000);
  });

  it("generates shop items with sell-price-derived costs", () => {
    vi.spyOn(Date, "now").mockReturnValue(2000);
    mockRandomSequence([0, 0, 0]);

    const item = genShopItem(1, "weapon");

    expect(item.slot).toBe("weapon");
    expect(item.type).toBe("weapon");
    expect(item.itemLevel).toBe(1);
    expect(item.rarity).toBe("normal");
    expect(item.cost).toBeGreaterThan(0);
    expect(item.uid).toBe(2000);
  });

  it("preserves the legacy auction RNG contract for a fixed random sequence", () => {
    vi.spyOn(Date, "now").mockReturnValue(3000);
    const randomValues = [0.74, 0.6, 0.8, 0.35, 0.9, 0.1, 0.2, 0.4, 0.65, 0.85, 0.15, 0.55, 0.25, 0.95, 0.05, 0.45, 0.75, 0.3, 0.7, 0.12];

    mockRandomSequence(randomValues);
    expect(genAuctionItem(12)).toEqual({
      name: "【神話】強化刺刀之狂怒",
      slot: "weapon",
      cat: "dagger",
      attack: 88,
      defense: 23,
      hp: 50,
      speed: 3,
      icon: "🗡️",
      lvReq: 4,
      rarity: "mythic",
      rarityLabel: "神話",
      rarityColor: "#e07020",
      rarityGlow: "0 0 14px #e0702055",
      affixes: [
        { id: "fortified", tag: "強化", type: "prefix", stat: "defense", min: 5, max: 14, slots: ["armor", "offhand", "helmet", "gloves", "boots", "weapon"], rolledVal: 19 },
        { id: "fury", tag: "狂怒", type: "suffix", special: "fury", val: [4, 12], slots: ["weapon"], rolledVal: 9 },
        { id: "vital", tag: "活力", type: "prefix", stat: "hp", min: 15, max: 45, slots: ["weapon", "offhand", "armor", "helmet", "gloves", "boots", "ring", "amulet"], rolledVal: 40 },
        { id: "pierce", tag: "穿透", type: "suffix", special: "pierce", val: [10, 30], slots: ["weapon"], rolledVal: 19 },
        { id: "brutal", tag: "殘酷", type: "prefix", stat: "attack", min: 12, max: 28, slots: ["weapon"], rolledVal: 42 },
        { id: "heavy", tag: "沉重", type: "prefix", stat: "attack", min: 5, max: 14, slots: ["weapon"], rolledVal: 20 },
      ],
      specials: [
        { type: "fury", val: 9 },
        { type: "pierce", val: 19 },
      ],
      uid: 3000.12,
      type: "weapon",
      itemLevel: 12,
      cost: 345150,
      auctionId: 3000,
      baseBid: 172575,
      currentBid: 172575,
      myBid: 0,
      bidCount: 0,
      endsIn: 3,
      sold: false,
    });
  });

  it("generates auction items with bidding metadata", () => {
    vi.spyOn(Date, "now").mockReturnValue(3000);
    mockRandomSequence([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    const item: any = genAuctionItem(1);

    expect(["rare", "legendary", "mythic"]).toContain(item.rarity);
    expect(item.auctionId).toBe(3000);
    expect(item.baseBid).toBe(Math.floor(item.cost * 0.5));
    expect(item.currentBid).toBe(item.baseBid);
    expect(item.myBid).toBe(0);
    expect(item.sold).toBe(false);
  });

  it("generates mercenary scrolls with forced rarity and mercenary shape", () => {
    vi.spyOn(Date, "now").mockReturnValue(4000);
    mockRandomSequence([0, 0, 0, 0, 0, 0, 0]);

    const scroll = genMercScroll(10, "mythic");

    expect(scroll.type).toBe("merc_scroll");
    expect(scroll.slot).toBe("merc_scroll");
    expect(scroll.scrollGrade).toBe("mythic");
    expect(scroll.rarity).toBe("mythic");
    expect(scroll.affixes).toHaveLength(3);
    expect(scroll.specials.length).toBeGreaterThanOrEqual(0);
    expect(scroll.uid).toBe(4000);
  });
});
