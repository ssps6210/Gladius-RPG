import { describe, expect, it } from "vitest";

import { ENHANCE_LEVELS } from "./enhanceLevels";
import { EQUIP_SLOTS } from "./equipmentSlots";
import { ALL_BASE_ITEMS, BASE_WEAPONS } from "./itemBases";
import { TRAIN_STATS } from "./trainStats";
import { WEAPON_CATEGORIES } from "./weaponCategories";

describe("core data tables", () => {
  it("keeps the equipment slot order stable", () => {
    expect(EQUIP_SLOTS.map((slot) => slot.id)).toEqual([
      "weapon",
      "offhand",
      "helmet",
      "armor",
      "gloves",
      "boots",
      "ring",
      "amulet",
    ]);
  });

  it("preserves representative weapon category traits", () => {
    expect(WEAPON_CATEGORIES.dagger.trait).toBe("swift");
    expect(WEAPON_CATEGORIES.staff.traitDesc).toContain("吸血效果翻倍");
  });

  it("keeps enhance level anchors unchanged", () => {
    expect(ENHANCE_LEVELS).toHaveLength(10);
    expect(ENHANCE_LEVELS[0]?.rate).toBe(0.9);
  });

  it("marks trainedHp as the hp training stat", () => {
    expect(TRAIN_STATS.find((stat) => stat.id === "trainedHp")).toMatchObject({
      hpStat: true,
    });
  });

  it("includes the starter sword and combined base item pool", () => {
    expect(BASE_WEAPONS.some((weapon) => weapon.name === "短劍")).toBe(true);
    expect(ALL_BASE_ITEMS.length).toBeGreaterThan(BASE_WEAPONS.length);
  });
});
