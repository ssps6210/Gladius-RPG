const SLOT_GROUPS: Record<string, string[]> = {
  weapon: ["weapon"],
  armor: ["armor", "offhand", "helmet", "gloves", "boots"],
  jewelry: ["ring", "amulet"],
  all: ["weapon", "offhand", "armor", "helmet", "gloves", "boots", "ring", "amulet"],
};

export const AFFIXES: Array<Record<string, any>> = [
  { id: "sharp", tag: "鋒利", tagEn: "Sharp", type: "prefix", stat: "attack", min: 3, max: 10, slots: SLOT_GROUPS.weapon },
  { id: "heavy", tag: "沉重", tagEn: "Heavy", type: "prefix", stat: "attack", min: 5, max: 14, slots: SLOT_GROUPS.weapon },
  { id: "blessed", tag: "神佑", tagEn: "Blessed", type: "prefix", stat: "attack", min: 8, max: 20, slots: SLOT_GROUPS.weapon },
  { id: "brutal", tag: "殘酷", tagEn: "Brutal", type: "prefix", stat: "attack", min: 12, max: 28, slots: SLOT_GROUPS.weapon },
  { id: "sturdy", tag: "堅固", tagEn: "Sturdy", type: "prefix", stat: "defense", min: 3, max: 8, slots: SLOT_GROUPS.armor },
  { id: "fortified", tag: "強化", tagEn: "Fortified", type: "prefix", stat: "defense", min: 5, max: 14, slots: [...SLOT_GROUPS.armor, ...SLOT_GROUPS.weapon] },
  { id: "vital", tag: "活力", tagEn: "Vital", type: "prefix", stat: "hp", min: 15, max: 45, slots: SLOT_GROUPS.all },
  { id: "swift", tag: "迅捷", tagEn: "Swift", type: "prefix", stat: "speed", min: 2, max: 7, slots: [...SLOT_GROUPS.weapon, ...SLOT_GROUPS.armor, "boots"] },
  { id: "power", tag: "力量", tagEn: "Power", type: "prefix", stat: "attack", min: 4, max: 12, slots: [...SLOT_GROUPS.jewelry] },
  { id: "resilient", tag: "韌性", tagEn: "Resilient", type: "prefix", stat: "defense", min: 3, max: 9, slots: [...SLOT_GROUPS.jewelry] },
  { id: "lifesteal", tag: "吸血", tagEn: "Vampiric", type: "suffix", special: "lifesteal", val: [3, 10], slots: SLOT_GROUPS.weapon },
  { id: "thorns", tag: "荊棘", tagEn: "Thorned", type: "suffix", special: "thorns", val: [2, 8], slots: SLOT_GROUPS.armor },
  { id: "crit", tag: "爆擊", tagEn: "Critical", type: "suffix", special: "crit", val: [5, 25], slots: SLOT_GROUPS.weapon },
  { id: "regen", tag: "回復", tagEn: "Regenerative", type: "suffix", special: "regen", val: [2, 6], slots: [...SLOT_GROUPS.armor, ...SLOT_GROUPS.jewelry] },
  { id: "fury", tag: "狂怒", tagEn: "Furious", type: "suffix", special: "fury", val: [4, 12], slots: SLOT_GROUPS.weapon },
  { id: "pierce", tag: "穿透", tagEn: "Piercing", type: "suffix", special: "pierce", val: [10, 30], slots: SLOT_GROUPS.weapon },
  { id: "vampiric", tag: "吸魂", tagEn: "Soulsucker", type: "suffix", special: "vampiric", val: [5, 15], slots: [...SLOT_GROUPS.armor, ...SLOT_GROUPS.jewelry] },
  { id: "reflect", tag: "反射", tagEn: "Reflecting", type: "suffix", special: "reflect", val: [3, 10], slots: ["offhand"] },
];
