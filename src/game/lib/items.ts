import { ENHANCE_LEVELS } from "../data/enhanceLevels";
import type { RuntimeItem } from "../types";

type ItemLike = RuntimeItem & Record<string, any>;

const SELL_RARITY_MULTIPLIERS = {
  normal: 1,
  magic: 2.5,
  rare: 6,
  legendary: 15,
  mythic: 35,
} as const;

export function calcSellPrice(item: ItemLike | null | undefined) {
  if (!item) {
    return 0;
  }

  const rarityMultiplier = SELL_RARITY_MULTIPLIERS[item.rarity as keyof typeof SELL_RARITY_MULTIPLIERS] ?? 1;
  const statSum = (item.attack || 0) + (item.defense || 0) + (item.hp || 0) * 0.4 + (item.speed || 0) * 2;
  const levelMultiplier = item.itemLevel ? 1 + item.itemLevel * 0.05 : 1;

  if (item.type === "potion") {
    return Math.max(5, Math.floor((item.cost as number) * 0.4 || 10));
  }

  if (item.type === "merc_scroll") {
    return Math.floor(30 * rarityMultiplier);
  }

  return Math.max(5, Math.floor(statSum * rarityMultiplier * levelMultiplier * 0.4));
}

export function enhanceCost(item: ItemLike) {
  const base = Math.max(30, calcSellPrice(item) * 1.5);
  const levelData = ENHANCE_LEVELS[item.enhLv || 0];

  return levelData ? Math.floor(base * levelData.costMult) : 0;
}

export function applyEnhanceBonus(item: ItemLike) {
  if (!item.enhLv) {
    return item;
  }

  const totalBonus = ENHANCE_LEVELS.slice(0, item.enhLv).reduce((sum, level) => sum + level.bonus, 0);

  return {
    ...item,
    attack: Math.floor((item.baseAttack || item.attack || 0) * (1 + totalBonus)),
    defense: Math.floor((item.baseDefense || item.defense || 0) * (1 + totalBonus)),
    hp: Math.floor((item.baseHp || item.hp || 0) * (1 + totalBonus)),
    speed: Math.floor((item.baseSpeed || item.speed || 0) * (1 + totalBonus)),
  };
}
