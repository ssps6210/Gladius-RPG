export const BASE_WEAPONS: Array<Record<string, any>> = [
  { name: "短劍", nameEn: "Short Sword", slot: "weapon", cat: "sword", attack: 6, icon: "⚔️", lvReq: 1 },
  { name: "長劍", nameEn: "Long Sword", slot: "weapon", cat: "sword", attack: 11, icon: "⚔️", lvReq: 4 },
  { name: "闊劍", nameEn: "Broadsword", slot: "weapon", cat: "sword", attack: 17, icon: "⚔️", lvReq: 8 },
  { name: "格鬥劍", nameEn: "Combat Sword", slot: "weapon", cat: "sword", attack: 22, icon: "⚔️", lvReq: 12 },
  { name: "匕首", nameEn: "Dagger", slot: "weapon", cat: "dagger", attack: 5, speed: 2, icon: "🗡️", lvReq: 1 },
  { name: "刺刀", nameEn: "Stiletto", slot: "weapon", cat: "dagger", attack: 9, speed: 3, icon: "🗡️", lvReq: 4 },
  { name: "影刃", nameEn: "Shadow Blade", slot: "weapon", cat: "dagger", attack: 14, speed: 4, icon: "🗡️", lvReq: 8 },
  { name: "手斧", nameEn: "Hatchet", slot: "weapon", cat: "axe", attack: 8, icon: "🪓", lvReq: 2 },
  { name: "戰斧", nameEn: "Battle Axe", slot: "weapon", cat: "axe", attack: 15, icon: "🪓", lvReq: 6 },
  { name: "雙頭戰斧", nameEn: "Double Axe", slot: "weapon", cat: "axe", attack: 24, icon: "🪓", lvReq: 11 },
  { name: "木槌", nameEn: "Wooden Mallet", slot: "weapon", cat: "hammer", attack: 7, icon: "🔨", lvReq: 1 },
  { name: "戰鎚", nameEn: "War Hammer", slot: "weapon", cat: "hammer", attack: 13, icon: "🔨", lvReq: 5 },
  { name: "重力鎚", nameEn: "Gravity Hammer", slot: "weapon", cat: "hammer", attack: 21, icon: "🔨", lvReq: 10 },
  { name: "短矛", nameEn: "Short Spear", slot: "weapon", cat: "spear", attack: 8, icon: "🏹", lvReq: 2 },
  { name: "長矛", nameEn: "Long Spear", slot: "weapon", cat: "spear", attack: 14, icon: "🏹", lvReq: 6 },
  { name: "龍牙矛", nameEn: "Dragon Fang Spear", slot: "weapon", cat: "spear", attack: 22, icon: "🏹", lvReq: 11 },
  { name: "漁夫三叉戟", nameEn: "Fisher's Trident", slot: "weapon", cat: "trident", attack: 9, icon: "🔱", lvReq: 3 },
  { name: "戰士三叉戟", nameEn: "Warrior's Trident", slot: "weapon", cat: "trident", attack: 18, icon: "🔱", lvReq: 9 },
  { name: "收割鐮", nameEn: "Reaping Scythe", slot: "weapon", cat: "sickle", attack: 7, icon: "☽", lvReq: 2 },
  { name: "死亡鐮", nameEn: "Death Scythe", slot: "weapon", cat: "sickle", attack: 16, icon: "☽", lvReq: 8 },
  { name: "死神之翼", nameEn: "Reaper's Wing", slot: "weapon", cat: "angel", attack: 20, icon: "🪽", lvReq: 10 },
  { name: "末日使者", nameEn: "Doombringer", slot: "weapon", cat: "angel", attack: 28, icon: "🪽", lvReq: 14 },
  { name: "棍棒", nameEn: "Club", slot: "weapon", cat: "club", attack: 5, icon: "🪵", lvReq: 1 },
  { name: "法杖", nameEn: "Staff", slot: "weapon", cat: "staff", attack: 10, icon: "🪄", lvReq: 3 },
  { name: "古代法杖", nameEn: "Ancient Staff", slot: "weapon", cat: "staff", attack: 18, icon: "🪄", lvReq: 9 },
];

export const BASE_OFFHANDS: Array<Record<string, any>> = [
  { name: "木盾", nameEn: "Wood Shield", slot: "offhand", defense: 4, hp: 10, icon: "🛡️", lvReq: 1 },
  { name: "鐵盾", nameEn: "Iron Shield", slot: "offhand", defense: 8, hp: 20, icon: "🛡️", lvReq: 4 },
  { name: "塔盾", nameEn: "Tower Shield", slot: "offhand", defense: 14, hp: 35, icon: "🛡️", lvReq: 8 },
  { name: "龍鱗盾", nameEn: "Dragon Shield", slot: "offhand", defense: 20, hp: 50, icon: "🛡️", lvReq: 12 },
  { name: "魔法典籍", nameEn: "Magic Tome", slot: "offhand", attack: 5, hp: 15, icon: "📖", lvReq: 5 },
];

export const BASE_HELMETS: Array<Record<string, any>> = [
  { name: "皮帽", nameEn: "Leather Cap", slot: "helmet", defense: 3, hp: 15, icon: "⛑️", lvReq: 1 },
  { name: "鐵盔", nameEn: "Iron Helm", slot: "helmet", defense: 6, hp: 22, icon: "⛑️", lvReq: 4 },
  { name: "鋼盔", nameEn: "Steel Helm", slot: "helmet", defense: 10, hp: 32, icon: "🪖", lvReq: 8 },
  { name: "龍骨盔", nameEn: "Dragonbone Helm", slot: "helmet", defense: 15, hp: 50, icon: "🪖", lvReq: 12 },
];

export const BASE_ARMORS: Array<Record<string, any>> = [
  { name: "皮甲", nameEn: "Leather Armor", slot: "armor", defense: 4, icon: "🥋", lvReq: 1 },
  { name: "鎖甲", nameEn: "Chain Mail", slot: "armor", defense: 9, icon: "🥋", lvReq: 3 },
  { name: "板甲", nameEn: "Plate Armor", slot: "armor", defense: 16, icon: "🥋", lvReq: 7 },
  { name: "法袍", nameEn: "Mage Robe", slot: "armor", defense: 5, hp: 25, icon: "👘", lvReq: 2 },
  { name: "龍鱗甲", nameEn: "Dragon Scale Armor", slot: "armor", defense: 22, icon: "🥋", lvReq: 12 },
];

export const BASE_GLOVES: Array<Record<string, any>> = [
  { name: "皮手套", nameEn: "Leather Gloves", slot: "gloves", defense: 2, attack: 1, icon: "🧤", lvReq: 1 },
  { name: "鐵腕甲", nameEn: "Iron Gauntlet", slot: "gloves", defense: 5, attack: 2, icon: "🧤", lvReq: 5 },
  { name: "爪刃手套", nameEn: "Claw Gloves", slot: "gloves", defense: 4, attack: 5, icon: "🧤", lvReq: 9 },
];

export const BASE_BOOTS: Array<Record<string, any>> = [
  { name: "皮靴", nameEn: "Leather Boots", slot: "boots", defense: 2, speed: 1, icon: "👢", lvReq: 1 },
  { name: "鐵靴", nameEn: "Iron Boots", slot: "boots", defense: 5, speed: 1, icon: "👢", lvReq: 5 },
  { name: "疾風靴", nameEn: "Windrunner Boots", slot: "boots", defense: 3, speed: 4, icon: "👢", lvReq: 9 },
];

export const BASE_RINGS: Array<Record<string, any>> = [
  { name: "銅戒指", nameEn: "Copper Ring", slot: "ring", attack: 2, icon: "💍", lvReq: 1 },
  { name: "銀戒指", nameEn: "Silver Ring", slot: "ring", attack: 4, icon: "💍", lvReq: 5 },
  { name: "金戒指", nameEn: "Gold Ring", slot: "ring", hp: 20, icon: "💍", lvReq: 3 },
  { name: "寶石戒指", nameEn: "Gem Ring", slot: "ring", attack: 6, defense: 3, icon: "💍", lvReq: 9 },
];

export const BASE_AMULETS: Array<Record<string, any>> = [
  { name: "骨質護符", nameEn: "Bone Amulet", slot: "amulet", defense: 3, icon: "📿", lvReq: 1 },
  { name: "月神護符", nameEn: "Moon Amulet", slot: "amulet", hp: 25, icon: "📿", lvReq: 4 },
  { name: "戰神護符", nameEn: "War God Amulet", slot: "amulet", attack: 5, icon: "📿", lvReq: 7 },
  { name: "龍魂護符", nameEn: "Dragon Soul Amulet", slot: "amulet", attack: 4, hp: 30, icon: "📿", lvReq: 11 },
];

export const ALL_BASE_ITEMS: Array<Record<string, any>> = [
  ...BASE_WEAPONS,
  ...BASE_OFFHANDS,
  ...BASE_HELMETS,
  ...BASE_ARMORS,
  ...BASE_GLOVES,
  ...BASE_BOOTS,
  ...BASE_RINGS,
  ...BASE_AMULETS,
];
