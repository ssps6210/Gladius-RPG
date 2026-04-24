import { AFFIXES } from "../data/affixes";
import { ALL_BASE_ITEMS } from "../data/itemBases";
import { MERC_BASES, MERC_SCROLL_AFFIXES } from "../data/mercenaries";
import { RARITIES } from "../data/rarities";
import { calcSellPrice } from "../lib/items";

type AnyRecord = Record<string, any>;

export const getRarity = (id: any): any => RARITIES.find((r: any) => r.id === id) || RARITIES[0];

export function itemLevelScale(playerLevel: any) {
  const tier = Math.floor(playerLevel / 10);
  return Math.pow(1.25, tier);
}

export function rollRarity(bonus: any = 0): any {
  const adjusted: any[] = RARITIES.map((rarity: any) => ({
    ...rarity,
    weight:
      rarity.id === "normal"
        ? Math.max(5, rarity.weight - bonus * 80)
        : rarity.weight + bonus * (rarity.id === "mythic" ? 30 : rarity.id === "legendary" ? 15 : 5),
  }));
  const total = adjusted.reduce((sum, rarity) => sum + rarity.weight, 0);
  let roll = Math.random() * total;

  for (const rarity of adjusted) {
    roll -= rarity.weight;
    if (roll <= 0) {
      return rarity;
    }
  }

  return adjusted[0];
}

export function rollAffixes(slot: any, rarity: any, level: any) {
  if (rarity.maxAffixes === 0) {
    return [];
  }

  const count =
    rarity.id === "mythic"
      ? 6
      : rarity.id === "legendary"
        ? 4
        : rarity.id === "rare"
          ? 2 + Math.floor(Math.random() * 2)
          : 1 + Math.floor(Math.random() * 2);
  const eligible = AFFIXES.filter((affix) => affix.slots.includes(slot));
  const chosen: any[] = [];
  const used = new Set();

  for (let index = 0; index < count && index < eligible.length; index += 1) {
    const pool = eligible.filter((affix) => !used.has(affix.id));
    if (!pool.length) {
      break;
    }

    const affix = pool[Math.floor(Math.random() * pool.length)];
    used.add(affix.id);
    const scale = 1 + (level - 1) * 0.07;

    if (affix.stat) {
      chosen.push({ ...affix, rolledVal: Math.round((affix.min + Math.random() * (affix.max - affix.min)) * scale) });
      continue;
    }

    const [low, high] = affix.val;
    chosen.push({ ...affix, rolledVal: Math.round((low + Math.random() * (high - low)) * scale) });
  }

  return chosen;
}

export function buildName(base: any, rarity: any, affixes: any) {
  if (rarity.id === "normal") {
    return base.name;
  }

  const prefix = affixes.find((affix: any) => affix.type === "prefix");
  const suffix = affixes.find((affix: any) => affix.type === "suffix");
  let name = base.name;

  if (prefix) {
    name = prefix.tag + name;
  }
  if (suffix) {
    name = name + "之" + suffix.tag;
  }
  if (rarity.id === "mythic") {
    name = "【神話】" + name;
  }

  return name;
}

function buildEquipmentItem(base: any, rarity: any, affixes: any[], playerLevel: any) {
  const bonuses: AnyRecord = { attack: 0, defense: 0, hp: 0, speed: 0 };
  const specials: any[] = [];

  for (const affix of affixes) {
    if (affix.stat) {
      bonuses[affix.stat] = (bonuses[affix.stat] || 0) + affix.rolledVal;
    }
    if (affix.special) {
      specials.push({ type: affix.special, val: affix.rolledVal });
    }
  }

  const scale = itemLevelScale(playerLevel);

  return {
    ...base,
    name: buildName(base, rarity, affixes),
    attack: Math.floor(((base.attack || 0) + bonuses.attack) * scale),
    defense: Math.floor(((base.defense || 0) + bonuses.defense) * scale),
    hp: Math.floor(((base.hp || 0) + bonuses.hp) * scale),
    speed: Math.floor(((base.speed || 0) + bonuses.speed) * scale),
    rarity: rarity.id,
    rarityLabel: rarity.label,
    rarityColor: rarity.color,
    rarityGlow: rarity.glow || "",
    affixes,
    specials,
    uid: Date.now() + Math.random(),
    type: base.slot,
    itemLevel: playerLevel,
  };
}

export function genLoot(playerLevel: any, bonus: any = 0, forcedSlot: any = null) {
  const slotGroups = {
    weapon: ["weapon"],
    offhand: ["offhand"],
    helmet: ["helmet"],
    armor: ["armor"],
    gloves: ["gloves"],
    boots: ["boots"],
    ring: ["ring"],
    amulet: ["amulet"],
  };
  let base;

  if (forcedSlot) {
    const pool = ALL_BASE_ITEMS.filter((item) => item.slot === forcedSlot && item.lvReq <= playerLevel + 2);
    base = pool[Math.floor(Math.random() * pool.length)];
  } else {
    const slots = Object.keys(slotGroups);
    const chosenSlot = slots[Math.floor(Math.random() * slots.length)];
    const pool = ALL_BASE_ITEMS.filter((item) => item.slot === chosenSlot && item.lvReq <= playerLevel + 2);
    base = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : ALL_BASE_ITEMS.filter((item) => item.lvReq <= playerLevel + 2)[0];
  }

  const rarity = rollRarity(bonus);
  const affixes: any[] = rollAffixes(base.slot, rarity, playerLevel);

  return buildEquipmentItem(base, rarity, affixes, playerLevel);
}

export function genShopItem(playerLevel: any, slotHint: any = null) {
  const slots = ["weapon", "offhand", "armor", "helmet", "gloves", "boots", "ring", "amulet"];
  const slot = slotHint || slots[Math.floor(Math.random() * slots.length)];
  const pool = ALL_BASE_ITEMS.filter((item) => item.slot === slot && item.lvReq <= playerLevel + 3);
  const base = pool.length ? pool[Math.floor(Math.random() * pool.length)] : ALL_BASE_ITEMS.find((item) => item.slot === slot) || ALL_BASE_ITEMS[0];
  const rarity = rollRarity(Math.min(0.4, playerLevel * 0.01));
  const affixes: any[] = rollAffixes(base.slot, rarity, playerLevel);
  const item: AnyRecord = buildEquipmentItem(base, rarity, affixes, playerLevel);
  const rarityCostMultiplier = ({ normal: 1, magic: 2.8, rare: 7, legendary: 18, mythic: 45 } as AnyRecord)[rarity.id] || 1;

  item.cost = Math.floor(calcSellPrice(item) * 2.5 * rarityCostMultiplier);

  return item;
}

export function genAuctionItem(playerLevel: any) {
  const rarityPool = ["rare", "legendary", "mythic"];
  const forcedGrade = rarityPool[Math.floor(Math.random() * rarityPool.length)];
  // Preserve the legacy discarded shop roll so auction RNG stays in sync with old saves/replays.
  genShopItem(playerLevel);
  const rarity = getRarity(forcedGrade);
  const slots = ["weapon", "offhand", "armor", "helmet", "gloves", "boots", "ring", "amulet"];
  const slot = slots[Math.floor(Math.random() * slots.length)];
  const pool = ALL_BASE_ITEMS.filter((item) => item.slot === slot && item.lvReq <= playerLevel + 3);
  const base = pool.length ? pool[Math.floor(Math.random() * pool.length)] : ALL_BASE_ITEMS[0];
  const affixes: any[] = rollAffixes(base.slot, rarity, playerLevel);
  const auctionItem: AnyRecord = buildEquipmentItem(base, rarity, affixes, playerLevel);
  const rarityCostMultiplier = ({ normal: 1, magic: 2.8, rare: 7, legendary: 18, mythic: 45 } as AnyRecord)[rarity.id] || 1;

  auctionItem.cost = Math.floor(calcSellPrice(auctionItem) * 2.5 * rarityCostMultiplier);
  const baseBid = Math.floor(auctionItem.cost * 0.5);

  return {
    ...auctionItem,
    auctionId: Date.now() + Math.random(),
    baseBid,
    currentBid: baseBid,
    myBid: 0,
    bidCount: Math.floor(Math.random() * 5),
    endsIn: Math.floor(3 + Math.random() * 5),
    sold: false,
  };
}

export function genMercScroll(playerLevel: any, forceGrade: any = null): any {
  const bonus = Math.min(0.5, playerLevel * 0.015);
  const rarity = forceGrade ? getRarity(forceGrade) : rollRarity(bonus);
  const eligibleBases = MERC_BASES.filter((base) => {
    const baseRarity = RARITIES.findIndex((entry) => entry.id === base.grade);
    const scrollRarity = RARITIES.findIndex((entry) => entry.id === rarity.id);
    return baseRarity <= scrollRarity + 1;
  });
  const chosenBase = eligibleBases[Math.floor(Math.random() * eligibleBases.length)];
  const affixCount = rarity.id === "mythic" ? 3 : rarity.id === "legendary" ? 2 : rarity.id === "rare" ? 1 : 0;
  const rolledAffixes: any[] = [];
  const usedAffixes = new Set();
  const scale = 1 + (playerLevel - 1) * 0.05;

  for (let index = 0; index < affixCount; index += 1) {
    const pool = MERC_SCROLL_AFFIXES.filter((affix) => !usedAffixes.has(affix.id));
    if (!pool.length) {
      break;
    }

    const affix = pool[Math.floor(Math.random() * pool.length)];
    usedAffixes.add(affix.id);
    if (affix.stat) {
      rolledAffixes.push({ ...affix, rolledVal: Math.round((affix.min + Math.random() * (affix.max - affix.min)) * scale) });
      continue;
    }

    rolledAffixes.push({ ...affix, rolledVal: affix.val });
  }

  const bonuses: AnyRecord = { attack: 0, defense: 0, hp: 0, heal: 0 };
  const specials: any[] = [];
  for (const affix of rolledAffixes) {
    if (affix.stat) {
      bonuses[affix.stat] += affix.rolledVal;
    }
    if (affix.special) {
      specials.push({ type: affix.special, val: affix.rolledVal });
    }
  }

  const prefix = rolledAffixes.find((affix: any) => affix.stat);
  const suffix = rolledAffixes.find((affix: any) => affix.special);
  let name = chosenBase.name;
  if (prefix) {
    name = prefix.tag + name;
  }
  if (suffix) {
    name = name + "·" + suffix.tag;
  }
  if (rarity.id === "mythic") {
    name = "【神話】" + name;
  }

  return {
    ...chosenBase,
    name,
    attack: chosenBase.attack + bonuses.attack,
    defense: chosenBase.defense + bonuses.defense,
    hp: chosenBase.hp + bonuses.hp,
    heal: (chosenBase.heal || 0) + bonuses.heal,
    rarity: rarity.id,
    rarityLabel: rarity.label,
    rarityColor: rarity.color,
    rarityGlow: rarity.glow || "",
    affixes: rolledAffixes,
    specials,
    uid: Date.now() + Math.random(),
    type: "merc_scroll",
    slot: "merc_scroll",
    scrollGrade: rarity.id,
  };
}
