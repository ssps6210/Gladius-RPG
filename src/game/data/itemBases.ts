export const BASE_WEAPONS: Array<Record<string, any>> = [
  { name: "短劍", nameEn: "Short Sword", nameCn: "短剑", slot: "weapon", cat: "sword", attack: 6, icon: "⚔️", lvReq: 1 },
  { name: "長劍", nameEn: "Long Sword", nameCn: "长剑", slot: "weapon", cat: "sword", attack: 11, icon: "⚔️", lvReq: 4 },
  { name: "闊劍", nameEn: "Broadsword", nameCn: "阔剑", slot: "weapon", cat: "sword", attack: 17, icon: "⚔️", lvReq: 8 },
  { name: "格鬥劍", nameEn: "Combat Sword", nameCn: "格斗剑", slot: "weapon", cat: "sword", attack: 22, icon: "⚔️", lvReq: 12 },
  { name: "匕首", nameEn: "Dagger", nameCn: "匕首", slot: "weapon", cat: "dagger", attack: 5, speed: 2, icon: "🗡️", lvReq: 1 },
  { name: "刺刀", nameEn: "Stiletto", nameCn: "刺刀", slot: "weapon", cat: "dagger", attack: 9, speed: 3, icon: "🗡️", lvReq: 4 },
  { name: "影刃", nameEn: "Shadow Blade", nameCn: "影刃", slot: "weapon", cat: "dagger", attack: 14, speed: 4, icon: "🗡️", lvReq: 8 },
  { name: "手斧", nameEn: "Hatchet", nameCn: "手斧", slot: "weapon", cat: "axe", attack: 8, icon: "🪓", lvReq: 2 },
  { name: "戰斧", nameEn: "Battle Axe", nameCn: "战斧", slot: "weapon", cat: "axe", attack: 15, icon: "🪓", lvReq: 6 },
  { name: "雙頭戰斧", nameEn: "Double Axe", nameCn: "双头战斧", slot: "weapon", cat: "axe", attack: 24, icon: "🪓", lvReq: 11 },
  { name: "木槌", nameEn: "Wooden Mallet", nameCn: "木槌", slot: "weapon", cat: "hammer", attack: 7, icon: "🔨", lvReq: 1 },
  { name: "戰鎚", nameEn: "War Hammer", nameCn: "战锤", slot: "weapon", cat: "hammer", attack: 13, icon: "🔨", lvReq: 5 },
  { name: "重力鎚", nameEn: "Gravity Hammer", nameCn: "重力锤", slot: "weapon", cat: "hammer", attack: 21, icon: "🔨", lvReq: 10 },
  { name: "短矛", nameEn: "Short Spear", nameCn: "短矛", slot: "weapon", cat: "spear", attack: 8, icon: "🏹", lvReq: 2 },
  { name: "長矛", nameEn: "Long Spear", nameCn: "长矛", slot: "weapon", cat: "spear", attack: 14, icon: "🏹", lvReq: 6 },
  { name: "龍牙矛", nameEn: "Dragon Fang Spear", nameCn: "龙牙矛", slot: "weapon", cat: "spear", attack: 22, icon: "🏹", lvReq: 11 },
  { name: "漁夫三叉戟", nameEn: "Fisher's Trident", nameCn: "渔夫三叉戟", slot: "weapon", cat: "trident", attack: 9, icon: "🔱", lvReq: 3 },
  { name: "戰士三叉戟", nameEn: "Warrior's Trident", nameCn: "战士三叉戟", slot: "weapon", cat: "trident", attack: 18, icon: "🔱", lvReq: 9 },
  { name: "收割鐮", nameEn: "Reaping Scythe", nameCn: "收割镰", slot: "weapon", cat: "sickle", attack: 7, icon: "☽", lvReq: 2 },
  { name: "死亡鐮", nameEn: "Death Scythe", nameCn: "死亡镰", slot: "weapon", cat: "sickle", attack: 16, icon: "☽", lvReq: 8 },
  { name: "死神之翼", nameEn: "Reaper's Wing", nameCn: "死神之翼", slot: "weapon", cat: "angel", attack: 20, icon: "🪽", lvReq: 10 },
  { name: "末日使者", nameEn: "Doombringer", nameCn: "末日使者", slot: "weapon", cat: "angel", attack: 28, icon: "🪽", lvReq: 14 },
  { name: "棍棒", nameEn: "Club", nameCn: "棍棒", slot: "weapon", cat: "club", attack: 5, icon: "🪵", lvReq: 1 },
  { name: "法杖", nameEn: "Staff", nameCn: "法杖", slot: "weapon", cat: "staff", attack: 10, icon: "🪄", lvReq: 3 },
  { name: "古代法杖", nameEn: "Ancient Staff", nameCn: "古代法杖", slot: "weapon", cat: "staff", attack: 18, icon: "🪄", lvReq: 9 },
];

export const BASE_OFFHANDS: Array<Record<string, any>> = [
  { name: "木盾", nameEn: "Wood Shield", nameCn: "木盾", slot: "offhand", defense: 4, hp: 10, icon: "🛡️", lvReq: 1 },
  { name: "鐵盾", nameEn: "Iron Shield", nameCn: "铁盾", slot: "offhand", defense: 8, hp: 20, icon: "🛡️", lvReq: 4 },
  { name: "塔盾", nameEn: "Tower Shield", nameCn: "塔盾", slot: "offhand", defense: 14, hp: 35, icon: "🛡️", lvReq: 8 },
  { name: "龍鱗盾", nameEn: "Dragon Shield", nameCn: "龙鳞盾", slot: "offhand", defense: 20, hp: 50, icon: "🛡️", lvReq: 12 },
  { name: "魔法典籍", nameEn: "Magic Tome", nameCn: "魔法典籍", slot: "offhand", attack: 5, hp: 15, icon: "📖", lvReq: 5 },
];

export const BASE_HELMETS: Array<Record<string, any>> = [
  { name: "皮帽", nameEn: "Leather Cap", nameCn: "皮帽", slot: "helmet", defense: 3, hp: 15, icon: "⛑️", lvReq: 1 },
  { name: "鐵盔", nameEn: "Iron Helm", nameCn: "铁盔", slot: "helmet", defense: 6, hp: 22, icon: "⛑️", lvReq: 4 },
  { name: "鋼盔", nameEn: "Steel Helm", nameCn: "钢盔", slot: "helmet", defense: 10, hp: 32, icon: "🪖", lvReq: 8 },
  { name: "龍骨盔", nameEn: "Dragonbone Helm", nameCn: "龙骨盔", slot: "helmet", defense: 15, hp: 50, icon: "🪖", lvReq: 12 },
];

export const BASE_ARMORS: Array<Record<string, any>> = [
  { name: "皮甲", nameEn: "Leather Armor", nameCn: "皮甲", slot: "armor", defense: 4, icon: "🥋", lvReq: 1 },
  { name: "鎖甲", nameEn: "Chain Mail", nameCn: "锁甲", slot: "armor", defense: 9, icon: "🥋", lvReq: 3 },
  { name: "板甲", nameEn: "Plate Armor", nameCn: "板甲", slot: "armor", defense: 16, icon: "🥋", lvReq: 7 },
  { name: "法袍", nameEn: "Mage Robe", nameCn: "法袍", slot: "armor", defense: 5, hp: 25, icon: "👘", lvReq: 2 },
  { name: "龍鱗甲", nameEn: "Dragon Scale Armor", nameCn: "龙鳞甲", slot: "armor", defense: 22, icon: "🥋", lvReq: 12 },
];

export const BASE_GLOVES: Array<Record<string, any>> = [
  { name: "皮手套", nameEn: "Leather Gloves", nameCn: "皮手套", slot: "gloves", defense: 2, attack: 1, icon: "🧤", lvReq: 1 },
  { name: "鐵腕甲", nameEn: "Iron Gauntlet", nameCn: "铁腕甲", slot: "gloves", defense: 5, attack: 2, icon: "🧤", lvReq: 5 },
  { name: "爪刃手套", nameEn: "Claw Gloves", nameCn: "爪刃手套", slot: "gloves", defense: 4, attack: 5, icon: "🧤", lvReq: 9 },
];

export const BASE_BOOTS: Array<Record<string, any>> = [
  { name: "皮靴", nameEn: "Leather Boots", nameCn: "皮靴", slot: "boots", defense: 2, speed: 1, icon: "👢", lvReq: 1 },
  { name: "鐵靴", nameEn: "Iron Boots", nameCn: "铁靴", slot: "boots", defense: 5, speed: 1, icon: "👢", lvReq: 5 },
  { name: "疾風靴", nameEn: "Windrunner Boots", nameCn: "疾风靴", slot: "boots", defense: 3, speed: 4, icon: "👢", lvReq: 9 },
];

export const BASE_RINGS: Array<Record<string, any>> = [
  { name: "銅戒指", nameEn: "Copper Ring", nameCn: "铜戒指", slot: "ring", attack: 2, icon: "💍", lvReq: 1 },
  { name: "銀戒指", nameEn: "Silver Ring", nameCn: "银戒指", slot: "ring", attack: 4, icon: "💍", lvReq: 5 },
  { name: "金戒指", nameEn: "Gold Ring", nameCn: "金戒指", slot: "ring", hp: 20, icon: "💍", lvReq: 3 },
  { name: "寶石戒指", nameEn: "Gem Ring", nameCn: "宝石戒指", slot: "ring", attack: 6, defense: 3, icon: "💍", lvReq: 9 },
];

export const BASE_AMULETS: Array<Record<string, any>> = [
  { name: "骨質護符", nameEn: "Bone Amulet", nameCn: "骨质护符", slot: "amulet", defense: 3, icon: "📿", lvReq: 1 },
  { name: "月神護符", nameEn: "Moon Amulet", nameCn: "月神护符", slot: "amulet", hp: 25, icon: "📿", lvReq: 4 },
  { name: "戰神護符", nameEn: "War God Amulet", nameCn: "战神护符", slot: "amulet", attack: 5, icon: "📿", lvReq: 7 },
  { name: "龍魂護符", nameEn: "Dragon Soul Amulet", nameCn: "龙魂护符", slot: "amulet", attack: 4, hp: 30, icon: "📿", lvReq: 11 },
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
