import { describe, expect, it } from "vitest";

import { AFFIXES } from "./affixes";
import { ARENA_FIRST_NAMES, ARENA_LAST_NAMES, ARENA_TITLES } from "./arena";
import { DUNGEONS } from "./dungeons";
import { EXPEDITIONS } from "./expeditions";
import { MERC_BASES, MERC_DUNGEONS, MERC_SCROLL_AFFIXES } from "./mercenaries";
import { MONSTERS } from "./monsters";
import { QUEST_DEFS } from "./quests";
import { RARITIES } from "./rarities";
import { TAVERN_QUEST_DEFS } from "./tavernQuests";

describe("content data tables", () => {
  it("preserves representative content anchors", () => {
    expect(RARITIES[0]?.id).toBe("normal");
    expect(AFFIXES.find((affix) => affix.id === "sharp")).toMatchObject({
      tag: "鋒利",
      stat: "attack",
    });
    expect(MONSTERS.wolfKing).toMatchObject({
      name: "狼王",
      boss: true,
    });
    expect(EXPEDITIONS.find((expedition) => expedition.id === "e1")).toMatchObject({
      name: "狼群獵場",
      monster: "wolf",
    });
    expect(DUNGEONS.find((dungeon) => dungeon.id === 1)).toMatchObject({
      name: "野狼森林",
      boss: "wolfKing",
    });
    expect(MERC_BASES.find((mercenary) => mercenary.id === "soldier")).toMatchObject({
      name: "退役士兵",
      grade: "normal",
    });
    expect(MERC_SCROLL_AFFIXES.find((affix) => affix.id === "ms_all")).toMatchObject({
      tag: "精英",
      special: "all",
    });
    expect(MERC_DUNGEONS.find((dungeon) => dungeon.id === "m1")).toMatchObject({
      label: "城鎮清剿",
      boss: expect.objectContaining({ name: "盜賊首領" }),
    });
    expect(Object.keys(QUEST_DEFS)).toContain("d1");
    expect(TAVERN_QUEST_DEFS.find((quest) => quest.id === "wolf_hunt")).toMatchObject({
      reqLv: 1,
      targetMonster: "wolf",
      reqCount: 5,
      hint: expect.stringContaining("地下城"),
    });
    expect(ARENA_FIRST_NAMES).toContain("鐵拳");
    expect(ARENA_LAST_NAMES).toContain("戰士");
    expect(ARENA_TITLES).toContain("傳奇的");
  });
});
