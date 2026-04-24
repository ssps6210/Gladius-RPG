const SLOT_GROUPS: Record<string, string[]> = {
  weapon: ["weapon"],
  armor: ["armor", "offhand", "helmet", "gloves", "boots"],
  jewelry: ["ring", "amulet"],
  all: ["weapon", "offhand", "armor", "helmet", "gloves", "boots", "ring", "amulet"],
};

export const AFFIXES: Array<Record<string, any>> = [
  { id: "sharp", tag: "鋒利", type: "prefix", stat: "attack", min: 3, max: 10, slots: SLOT_GROUPS.weapon },
  { id: "heavy", tag: "沉重", type: "prefix", stat: "attack", min: 5, max: 14, slots: SLOT_GROUPS.weapon },
  { id: "blessed", tag: "神佑", type: "prefix", stat: "attack", min: 8, max: 20, slots: SLOT_GROUPS.weapon },
  { id: "brutal", tag: "殘酷", type: "prefix", stat: "attack", min: 12, max: 28, slots: SLOT_GROUPS.weapon },
  { id: "sturdy", tag: "堅固", type: "prefix", stat: "defense", min: 3, max: 8, slots: SLOT_GROUPS.armor },
  { id: "fortified", tag: "強化", type: "prefix", stat: "defense", min: 5, max: 14, slots: [...SLOT_GROUPS.armor, ...SLOT_GROUPS.weapon] },
  { id: "vital", tag: "活力", type: "prefix", stat: "hp", min: 15, max: 45, slots: SLOT_GROUPS.all },
  { id: "swift", tag: "迅捷", type: "prefix", stat: "speed", min: 2, max: 7, slots: [...SLOT_GROUPS.weapon, ...SLOT_GROUPS.armor, "boots"] },
  { id: "power", tag: "力量", type: "prefix", stat: "attack", min: 4, max: 12, slots: [...SLOT_GROUPS.jewelry] },
  { id: "resilient", tag: "韌性", type: "prefix", stat: "defense", min: 3, max: 9, slots: [...SLOT_GROUPS.jewelry] },
  { id: "lifesteal", tag: "吸血", type: "suffix", special: "lifesteal", val: [3, 10], slots: SLOT_GROUPS.weapon },
  { id: "thorns", tag: "荊棘", type: "suffix", special: "thorns", val: [2, 8], slots: SLOT_GROUPS.armor },
  { id: "crit", tag: "爆擊", type: "suffix", special: "crit", val: [5, 25], slots: SLOT_GROUPS.weapon },
  { id: "regen", tag: "回復", type: "suffix", special: "regen", val: [2, 6], slots: [...SLOT_GROUPS.armor, ...SLOT_GROUPS.jewelry] },
  { id: "fury", tag: "狂怒", type: "suffix", special: "fury", val: [4, 12], slots: SLOT_GROUPS.weapon },
  { id: "pierce", tag: "穿透", type: "suffix", special: "pierce", val: [10, 30], slots: SLOT_GROUPS.weapon },
  { id: "vampiric", tag: "吸魂", type: "suffix", special: "vampiric", val: [5, 15], slots: [...SLOT_GROUPS.armor, ...SLOT_GROUPS.jewelry] },
  { id: "reflect", tag: "反射", type: "suffix", special: "reflect", val: [3, 10], slots: ["offhand"] },
];
