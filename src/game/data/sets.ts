export interface SetBonus {
  pieces: number;
  description: string;
  descriptionEn?: string;
  descriptionCn?: string;
  effect: {
    attack?: number;
    defense?: number;
    hp?: number;
    speed?: number;
    critChance?: number;
    lifesteal?: number;
    damageReduction?: number;
    expBonus?: number;
  };
}

export interface SetDefinition {
  id: string;
  name: string;
  nameEn?: string;
  nameCn?: string;
  icon: string;
  description: string;
  descriptionEn?: string;
  descriptionCn?: string;
  bonuses: SetBonus[];
  /** Item names that belong to this set */
  itemNames: string[];
}

export const ITEM_SETS: SetDefinition[] = [
  {
    id: "dragon",
    name: "古龍套裝",
    nameEn: "Dragon Set",
    nameCn: "古龙套装",
    icon: "🐉",
    description: "遠古巨龍的力量流淌於裝備之中",
    descriptionEn: "The power of the ancient dragon flows through the gear",
    descriptionCn: "远古巨龙的力量流淌于装备之中",
    itemNames: ["龍鱗盾", "龍骨盔", "龍鱗甲", "龍魂護符"],
    bonuses: [
      { pieces: 2, description: "攻擊+8，防禦+5", descriptionEn: "ATK+8, DEF+5", descriptionCn: "攻击+8，防御+5", effect: { attack: 8, defense: 5 } },
      { pieces: 3, description: "最大HP+40，傷害減免8%", descriptionEn: "Max HP+40, 8% dmg reduction", descriptionCn: "最大HP+40，伤害减免8%", effect: { hp: 40, damageReduction: 8 } },
      { pieces: 4, description: "攻擊+15，吸血5%", descriptionEn: "ATK+15, 5% lifesteal", descriptionCn: "攻击+15，吸血5%", effect: { attack: 15, lifesteal: 5 } },
    ],
  },
  {
    id: "shadow",
    name: "暗影套裝",
    nameEn: "Shadow Set",
    nameCn: "暗影套装",
    icon: "🌑",
    description: "來自暗影的力量，賜予持有者極致的速度",
    descriptionEn: "Power from the shadows grants the wearer ultimate speed",
    descriptionCn: "来自暗影的力量，赐予持有者极致的速度",
    itemNames: ["匕首", "刺刀", "影刃", "疾風靴"],
    bonuses: [
      { pieces: 2, description: "速度+6，攻擊+5", descriptionEn: "SPD+6, ATK+5", descriptionCn: "速度+6，攻击+5", effect: { speed: 6, attack: 5 } },
      { pieces: 3, description: "爆擊機率+10%，速度+4", descriptionEn: "+10% crit, SPD+4", descriptionCn: "爆击概率+10%，速度+4", effect: { critChance: 10, speed: 4 } },
      { pieces: 4, description: "攻擊+12，經驗+15%", descriptionEn: "ATK+12, +15% EXP", descriptionCn: "攻击+12，经验+15%", effect: { attack: 12, expBonus: 15 } },
    ],
  },
  {
    id: "iron",
    name: "鐵壁套裝",
    nameEn: "Iron Wall Set",
    nameCn: "铁壁套装",
    icon: "🛡️",
    description: "堅不可摧的重型裝備，鑄就不動的防線",
    descriptionEn: "Indestructible heavy gear forms an immovable defense",
    descriptionCn: "坚不可摧的重型装备，铸就不动的防线",
    itemNames: ["鐵盾", "鐵盔", "鎖甲", "鐵靴", "鐵腕甲"],
    bonuses: [
      { pieces: 2, description: "防禦+10，最大HP+20", descriptionEn: "DEF+10, Max HP+20", descriptionCn: "防御+10，最大HP+20", effect: { defense: 10, hp: 20 } },
      { pieces: 3, description: "防禦+15，傷害減免10%", descriptionEn: "DEF+15, 10% dmg reduction", descriptionCn: "防御+15，伤害减免10%", effect: { defense: 15, damageReduction: 10 } },
      { pieces: 4, description: "最大HP+60，防禦+10", descriptionEn: "Max HP+60, DEF+10", descriptionCn: "最大HP+60，防御+10", effect: { hp: 60, defense: 10 } },
      { pieces: 5, description: "吸血8%，攻擊+10", descriptionEn: "8% lifesteal, ATK+10", descriptionCn: "吸血8%，攻击+10", effect: { lifesteal: 8, attack: 10 } },
    ],
  },
  {
    id: "holy",
    name: "神聖套裝",
    nameEn: "Holy Set",
    nameCn: "神圣套装",
    icon: "✝️",
    description: "受神明祝福的裝備，擁有治癒與制裁之力",
    descriptionEn: "Gear blessed by the gods, with power to heal and to judge",
    descriptionCn: "受神明祝福的装备，拥有治愈与制裁之力",
    itemNames: ["月神護符", "法杖", "古代法杖", "法袍", "魔法典籍"],
    bonuses: [
      { pieces: 2, description: "最大HP+30，攻擊+6", descriptionEn: "Max HP+30, ATK+6", descriptionCn: "最大HP+30，攻击+6", effect: { hp: 30, attack: 6 } },
      { pieces: 3, description: "吸血8%，經驗+10%", descriptionEn: "8% lifesteal, +10% EXP", descriptionCn: "吸血8%，经验+10%", effect: { lifesteal: 8, expBonus: 10 } },
      { pieces: 4, description: "攻擊+18，爆擊機率+8%", descriptionEn: "ATK+18, +8% crit", descriptionCn: "攻击+18，爆击概率+8%", effect: { attack: 18, critChance: 8 } },
    ],
  },
  {
    id: "berserker",
    name: "狂戰士套裝",
    nameEn: "Berserker Set",
    nameCn: "狂战士套装",
    icon: "🪓",
    description: "狂暴的力量匯聚於身，以攻代守",
    descriptionEn: "Savage power surges within — offense as defense",
    descriptionCn: "狂暴的力量汇聚于身，以攻代守",
    itemNames: ["手斧", "戰斧", "雙頭戰斧", "皮手套", "爪刃手套"],
    bonuses: [
      { pieces: 2, description: "攻擊+10，速度+3", descriptionEn: "ATK+10, SPD+3", descriptionCn: "攻击+10，速度+3", effect: { attack: 10, speed: 3 } },
      { pieces: 3, description: "爆擊機率+12%，攻擊+8", descriptionEn: "+12% crit, ATK+8", descriptionCn: "爆击概率+12%，攻击+8", effect: { critChance: 12, attack: 8 } },
      { pieces: 4, description: "吸血10%，速度+5", descriptionEn: "10% lifesteal, SPD+5", descriptionCn: "吸血10%，速度+5", effect: { lifesteal: 10, speed: 5 } },
      { pieces: 5, description: "攻擊+20，經驗+20%", descriptionEn: "ATK+20, +20% EXP", descriptionCn: "攻击+20，经验+20%", effect: { attack: 20, expBonus: 20 } },
    ],
  },
  {
    id: "death",
    name: "死神套裝",
    nameEn: "Reaper Set",
    nameCn: "死神套装",
    icon: "💀",
    description: "收割一切的死神之力",
    descriptionEn: "The reaper's power that harvests all",
    descriptionCn: "收割一切的死神之力",
    itemNames: ["收割鐮", "死亡鐮", "死神之翼", "末日使者", "骨質護符"],
    bonuses: [
      { pieces: 2, description: "攻擊+10，吸血5%", descriptionEn: "ATK+10, 5% lifesteal", descriptionCn: "攻击+10，吸血5%", effect: { attack: 10, lifesteal: 5 } },
      { pieces: 3, description: "爆擊機率+10%，攻擊+12", descriptionEn: "+10% crit, ATK+12", descriptionCn: "爆击概率+10%，攻击+12", effect: { critChance: 10, attack: 12 } },
      { pieces: 4, description: "吸血12%，傷害減免5%", descriptionEn: "12% lifesteal, 5% dmg reduction", descriptionCn: "吸血12%，伤害减免5%", effect: { lifesteal: 12, damageReduction: 5 } },
    ],
  },
];

/** Quick lookup: item name -> set definition */
const _itemNameToSet = new Map<string, SetDefinition>();
for (const set of ITEM_SETS) {
  for (const name of set.itemNames) {
    _itemNameToSet.set(name, set);
  }
}

/** Get the set a specific item belongs to (if any) */
export function getSetForItem(itemName: string): SetDefinition | undefined {
  return _itemNameToSet.get(itemName);
}

/** Calculate active set bonuses from currently equipped items */
export function calculateSetBonuses(
  equipment: Record<string, { name?: string } | null>
): { set: SetDefinition; activePieces: number; activeBonus: SetBonus; allBonuses: SetBonus[] }[] {
  // Count how many pieces of each set are equipped
  const setCounts = new Map<string, { set: SetDefinition; count: number }>();

  for (const entry of Object.values(equipment)) {
    if (!entry?.name) continue;
    const set = _itemNameToSet.get(entry.name);
    if (!set) continue;

    const existing = setCounts.get(set.id);
    if (existing) {
      existing.count += 1;
    } else {
      setCounts.set(set.id, { set, count: 1 });
    }
  }

  // Determine active bonuses for each set
  const results: { set: SetDefinition; activePieces: number; activeBonus: SetBonus; allBonuses: SetBonus[] }[] = [];

  for (const { set, count } of setCounts.values()) {
    if (count < 2) continue; // Need at least 2 pieces

    // Find the highest bonus tier that fits
    let activeBonus: SetBonus | null = null;
    const activeBonuses: SetBonus[] = [];

    for (const bonus of set.bonuses) {
      if (count >= bonus.pieces) {
        activeBonus = bonus;
        activeBonuses.push(bonus);
      }
    }

    if (activeBonus) {
      results.push({ set, activePieces: count, activeBonus, allBonuses: activeBonuses });
    }
  }

  return results;
}

/** Aggregate all set bonus effects into a single stat modifier */
export function aggregateSetEffects(
  setBonuses: { allBonuses: SetBonus[] }[]
): {
  attack: number;
  defense: number;
  hp: number;
  speed: number;
  critChance: number;
  lifesteal: number;
  damageReduction: number;
  expBonus: number;
} {
  const total = {
    attack: 0,
    defense: 0,
    hp: 0,
    speed: 0,
    critChance: 0,
    lifesteal: 0,
    damageReduction: 0,
    expBonus: 0,
  };

  for (const { allBonuses } of setBonuses) {
    for (const bonus of allBonuses) {
      total.attack += bonus.effect.attack || 0;
      total.defense += bonus.effect.defense || 0;
      total.hp += bonus.effect.hp || 0;
      total.speed += bonus.effect.speed || 0;
      total.critChance += bonus.effect.critChance || 0;
      total.lifesteal += bonus.effect.lifesteal || 0;
      total.damageReduction += bonus.effect.damageReduction || 0;
      total.expBonus += bonus.effect.expBonus || 0;
    }
  }

  return total;
}
