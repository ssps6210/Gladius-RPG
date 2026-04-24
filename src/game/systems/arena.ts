import { INITIAL_EQUIPMENT } from "../constants";
import { ARENA_FIRST_NAMES, ARENA_LAST_NAMES, ARENA_TITLES } from "../data/arena";
import { WEAPON_CATEGORIES } from "../data/weaponCategories";
import { genLoot } from "./loot";

export function genArenaOpponent(playerLevel: any) {
  const firstName = ARENA_FIRST_NAMES[Math.floor(Math.random() * ARENA_FIRST_NAMES.length)];
  const lastName = ARENA_LAST_NAMES[Math.floor(Math.random() * ARENA_LAST_NAMES.length)];
  const title = ARENA_TITLES[Math.floor(Math.random() * ARENA_TITLES.length)];
  const name = `${title}${firstName}${lastName}`;

  const lvOffset = Math.floor(Math.random() * 7) - 3;
  const oppLv = Math.max(1, playerLevel + lvOffset);

  const tierRoll = Math.random();
  const tier = tierRoll < 0.35 ? "weak" : tierRoll < 0.7 ? "normal" : "strong";
  const tierMult =
    tier === "weak"
      ? 0.7 + Math.random() * 0.15
      : tier === "normal"
        ? 0.88 + Math.random() * 0.24
        : 1.1 + Math.random() * 0.3;

  const equipment: Record<string, any> = { ...INITIAL_EQUIPMENT };
  const slots = ["weapon", "offhand", "armor", "helmet", "gloves", "boots", "ring", "amulet"];
  const lootBonus = oppLv / 50 + (tier === "strong" ? 0.25 : tier === "weak" ? -0.1 : 0.05);

  slots.forEach((slot) => {
    equipment[slot] = Math.random() < 0.75 ? genLoot(oppLv, Math.max(0, lootBonus), slot) : null;
  });

  const baseAtk = Math.floor((8 + oppLv * 1.8) * tierMult);
  const baseDef = Math.floor((3 + oppLv * 0.9) * tierMult);
  const baseMhp = Math.floor((80 + oppLv * 12) * tierMult);
  const eqAtk = slots.reduce((sum, slot) => sum + (equipment[slot] ? equipment[slot].attack || 0 : 0), 0);
  const eqDef = slots.reduce((sum, slot) => sum + (equipment[slot] ? equipment[slot].defense || 0 : 0), 0);
  const eqHp = slots.reduce((sum, slot) => sum + (equipment[slot] ? equipment[slot].hp || 0 : 0), 0);
  const totalAtk = baseAtk + eqAtk;
  const totalDef = baseDef + eqDef;
  const totalMhp = baseMhp + eqHp;
  const goldCarried = Math.floor((50 + oppLv * 20 + Math.random() * oppLv * 30) * tierMult);
  const wcKeys = Object.keys(WEAPON_CATEGORIES);
  const wcKey = wcKeys[Math.floor(Math.random() * wcKeys.length)];

  return {
    id: Date.now() + Math.random(),
    name,
    title,
    level: oppLv,
    tier,
    attack: totalAtk,
    defense: totalDef,
    maxHp: totalMhp,
    hp: totalMhp,
    equipment,
    goldCarried,
    wcKey,
    wins: Math.floor(Math.random() * 30),
    losses: Math.floor(Math.random() * 15),
  };
}
