export const MERC_BASES: Array<Record<string, any>> = [
  { id: "soldier", name: "退役士兵", nameEn: "Veteran Soldier", nameCn: "退役士兵", icon: "🗡️", attack: 8, defense: 3, hp: 60, heal: 0, desc: "穩定輸出型步兵", descEn: "Steady damage infantry", descCn: "稳定输出型步兵", grade: "normal" },
  { id: "archer", name: "流浪弓手", nameEn: "Wandering Archer", nameCn: "流浪弓手", icon: "🏹", attack: 14, defense: 1, hp: 40, heal: 0, desc: "高攻擊低防禦", descEn: "High ATK, low DEF", descCn: "高攻击低防御", grade: "magic" },
  { id: "smith", name: "矮人鐵匠", nameEn: "Dwarf Smith", nameCn: "矮人铁匠", icon: "⚒️", attack: 6, defense: 12, hp: 100, heal: 0, desc: "高防替你擋傷", descEn: "High DEF, tanks damage for you", descCn: "高防替你挡伤", grade: "rare" },
  { id: "mage", name: "侏儒法師", nameEn: "Gnome Mage", nameCn: "侏儒法师", icon: "🧙", attack: 20, defense: 2, hp: 35, heal: 0, desc: "最高傷害輸出", descEn: "Highest damage output", descCn: "最高伤害输出", grade: "legendary" },
  { id: "healer", name: "精靈治癒師", nameEn: "Elf Healer", nameCn: "精灵治愈师", icon: "🧝", attack: 5, defense: 4, hp: 50, heal: 8, desc: "每回合回復 8HP", descEn: "Heals 8 HP per round", descCn: "每回合恢复 8HP", grade: "mythic" },
  { id: "berserker", name: "狂戰士", nameEn: "Berserker", nameCn: "狂战士", icon: "🪖", attack: 25, defense: 5, hp: 80, heal: 0, desc: "狂暴：攻擊+30%", descEn: "Rage: ATK +30%", descCn: "狂暴：攻击+30%", grade: "legendary" },
  { id: "paladin", name: "聖騎士", nameEn: "Paladin", nameCn: "圣骑士", icon: "⚜️", attack: 12, defense: 15, hp: 120, heal: 5, desc: "聖護：防禦+回血", descEn: "Holy: DEF + heal", descCn: "圣护：防御+回血", grade: "mythic" },
  { id: "assassin", name: "暗殺者", nameEn: "Assassin", nameCn: "暗杀者", icon: "🌑", attack: 30, defense: 2, hp: 30, heal: 0, desc: "暗殺：首攻×2", descEn: "Assassinate: first hit ×2", descCn: "暗杀：首攻×2", grade: "mythic" },
];

export const MERC_SCROLL_AFFIXES: Array<Record<string, any>> = [
  { id: "ms_atk", tag: "勇武", tagEn: "Valor", tagCn: "勇武", stat: "attack", min: 3, max: 15 },
  { id: "ms_def", tag: "堅壁", tagEn: "Bulwark", tagCn: "坚壁", stat: "defense", min: 2, max: 10 },
  { id: "ms_hp", tag: "強健", tagEn: "Vigor", tagCn: "强健", stat: "hp", min: 10, max: 50 },
  { id: "ms_heal", tag: "治癒", tagEn: "Healing", tagCn: "治愈", stat: "heal", min: 1, max: 6 },
  { id: "ms_all", tag: "精英", tagEn: "Elite", tagCn: "精英", special: "all", val: 0.15 },
  { id: "ms_first", tag: "先鋒", tagEn: "Vanguard", tagCn: "先锋", special: "first", val: 0.25 },
];

export const MERC_DUNGEONS: Array<Record<string, any>> = [
  {
    id: "m1", label: "城鎮清剿", labelEn: "Town Raid", labelCn: "城镇清剿", icon: "🏘️", minLv: 1, lvBonus: 0,
    lore: "一支盜賊團盤踞城鎮，傭兵們需要正面強攻。",
    loreEn: "A bandit gang holds the town — mercs must storm it head-on.",
    loreCn: "一支盗贼团盘踞城镇，佣兵们需要正面强攻。",
    waves: [
      { enemies: ["bandit", "bandit"], desc: "門口守衛", mult: 0.9 },
      { enemies: ["bandit", "bandit", "bandit"], desc: "主力盜賊隊", mult: 1.0 },
    ],
    boss: { name: "盜賊首領", nameEn: "Bandit Chief", nameCn: "盗贼首领", icon: "🗡️", hpM: 2.0, atkM: 1.5, defM: 1.0, trait: "dodge" },
    reward: { expMult: 1.2, goldMult: 1.5, scrollBonus: 0.20 },
  },
  {
    id: "m2", label: "礦坑奪寶", labelEn: "Mine Heist", labelCn: "矿坑夺宝", icon: "⛏️", minLv: 3, lvBonus: 2,
    lore: "深層礦坑藏有寶藏，但地精大軍和石巨人在守護。",
    loreEn: "Treasure lies deep in the mine, guarded by goblins and golems.",
    loreCn: "深层矿坑藏有宝藏，但地精大军和石巨人在守护。",
    waves: [
      { enemies: ["goblin", "goblin", "goblin"], desc: "地精前鋒隊", mult: 0.9 },
      { enemies: ["goblin", "golem"], desc: "石巨人現身", mult: 1.1 },
      { enemies: ["golem", "goblin", "goblin"], desc: "寶藏守護者", mult: 1.2 },
    ],
    boss: { name: "巨型石魔", nameEn: "Mega Stone Demon", nameCn: "巨型石魔", icon: "🪨", hpM: 3.0, atkM: 1.4, defM: 2.5, trait: "armor" },
    reward: { expMult: 1.4, goldMult: 2.0, scrollBonus: 0.30 },
  },
  {
    id: "m3", label: "神殿淨化", labelEn: "Temple Purge", labelCn: "神殿净化", icon: "🏛️", minLv: 6, lvBonus: 4,
    lore: "被詛咒的神殿充滿不死怨靈，傭兵們需要徹底淨化。",
    loreEn: "The cursed temple is full of undead — purge it completely.",
    loreCn: "被诅咒的神殿充满不死怨灵，佣兵们需要彻底净化。",
    waves: [
      { enemies: ["skeleton", "skeleton"], desc: "骷髏前哨", mult: 1.0 },
      { enemies: ["cultist", "demon"], desc: "祭司與惡魔", mult: 1.1 },
      { enemies: ["demon", "demon", "skeleton"], desc: "惡魔大軍", mult: 1.2 },
    ],
    boss: { name: "大惡魔君主", nameEn: "Demon Lord", nameCn: "大恶魔君主", icon: "👿", hpM: 3.5, atkM: 2.0, defM: 1.2, trait: "fire" },
    reward: { expMult: 1.8, goldMult: 2.5, scrollBonus: 0.40 },
  },
  {
    id: "m4", label: "龍巢突襲", labelEn: "Dragon Lair Raid", labelCn: "龙巢突袭", icon: "🐉", minLv: 10, lvBonus: 6,
    lore: "趁古龍沉睡之際突入龍巢，傭兵們能取多少帶多少。",
    loreEn: "Raid the dragon's lair while it sleeps — take what you can.",
    loreCn: "趁古龙沉睡之际突入龙巢，佣兵们能取多少带多少。",
    waves: [
      { enemies: ["wyvern", "wyvern"], desc: "幼龍巡邏隊", mult: 1.1 },
      { enemies: ["dragonKnight", "wyvern"], desc: "龍騎士阻擊", mult: 1.2 },
      { enemies: ["fireGiant", "dragonKnight", "wyvern"], desc: "龍巢核心守衛", mult: 1.4 },
    ],
    boss: { name: "龍騎將軍", nameEn: "Dragon Knight General", nameCn: "龙骑将军", icon: "⚔️", hpM: 4.0, atkM: 2.2, defM: 1.8, trait: "dragonArmor" },
    reward: { expMult: 2.2, goldMult: 3.0, scrollBonus: 0.50 },
  },
  {
    id: "m5", label: "虛空入侵", labelEn: "Void Invasion", labelCn: "虚空入侵", icon: "🌀", minLv: 15, lvBonus: 10,
    lore: "虛空裂縫突然開啟，高等傭兵緊急出動阻擋入侵者。",
    loreEn: "A void rift has opened — elite mercs scramble to hold the line.",
    loreCn: "虚空裂缝突然开启，高等佣兵紧急出动阻挡入侵者。",
    waves: [
      { enemies: ["shadowBeast", "shadowBeast", "lich"], desc: "虛空先鋒", mult: 1.2 },
      { enemies: ["titan", "shadowBeast"], desc: "泰坦壓陣", mult: 1.4 },
      { enemies: ["lich", "lich", "titan"], desc: "巫妖與泰坦聯軍", mult: 1.6 },
    ],
    boss: { name: "虛空先驅", nameEn: "Void Herald", nameCn: "虚空先驱", icon: "🌑", hpM: 4.5, atkM: 2.5, defM: 2.0, trait: "voidRip" },
    reward: { expMult: 3.0, goldMult: 4.0, scrollBonus: 0.70 },
  },
];
