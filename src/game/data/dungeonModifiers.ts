export interface DungeonModifier {
  id: string;
  label: string; labelEn: string; labelCn: string;
  desc: string; descEn: string; descCn: string;
  icon: string;
  type: "positive" | "negative" | "mixed";
  playerAtkMult?: number;
  playerDefMult?: number;
  playerHpMult?: number;
  monsterHpMult?: number;
  noWaveHeal?: boolean;
  expMult?: number;
  goldMult?: number;
}

export const DUNGEON_MODIFIERS: DungeonModifier[] = [
  // ── Positive ──────────────────────────────────────────────────
  {
    id: "sharpened",
    label: "鋒芒畢露", labelEn: "Sharpened", labelCn: "锋芒毕露",
    desc: "戰士進入狀態，攻擊+35%。", descEn: "In the zone. ATK +35%.", descCn: "战士进入状态，攻击+35%。",
    icon: "⚔",
    type: "positive",
    playerAtkMult: 1.35,
  },
  {
    id: "iron_shield",
    label: "銅牆鐵壁", labelEn: "Iron Shield", labelCn: "铜墙铁壁",
    desc: "防禦本能覺醒，防禦+35%。", descEn: "Defensive instincts awakened. DEF +35%.", descCn: "防御本能觉醒，防御+35%。",
    icon: "🛡",
    type: "positive",
    playerDefMult: 1.35,
  },
  {
    id: "blessed",
    label: "神明眷顧", labelEn: "Blessed", labelCn: "神明眷顾",
    desc: "命運女神垂青，EXP獲取+60%。", descEn: "Lady luck smiles upon you. EXP gain +60%.", descCn: "命运女神垂青，EXP获取+60%。",
    icon: "✨",
    type: "positive",
    expMult: 1.6,
  },
  {
    id: "gold_rush",
    label: "財神降臨", labelEn: "Gold Rush", labelCn: "财神降临",
    desc: "財運亨通，金幣獲取+70%。", descEn: "Riches abound. Gold gain +70%.", descCn: "财运亨通，金币获取+70%。",
    icon: "💰",
    type: "positive",
    goldMult: 1.7,
  },
  {
    id: "tiger_stance",
    label: "猛虎之勢", labelEn: "Tiger Stance", labelCn: "猛虎之势",
    desc: "攻守兼備，攻擊和防禦各+25%。", descEn: "Balanced power. ATK & DEF both +25%.", descCn: "攻守兼备，攻击和防御各+25%。",
    icon: "🐯",
    type: "positive",
    playerAtkMult: 1.25,
    playerDefMult: 1.25,
  },
  // ── Negative ──────────────────────────────────────────────────
  {
    id: "cursed",
    label: "詛咒之地", labelEn: "Cursed Ground", labelCn: "诅咒之地",
    desc: "土地浸染詛咒，攻擊-25%。", descEn: "Dark magic saps your strength. ATK -25%.", descCn: "土地浸染诅咒，攻击-25%。",
    icon: "💀",
    type: "negative",
    playerAtkMult: 0.75,
  },
  {
    id: "brittle",
    label: "脆骨之術", labelEn: "Brittle Bones", labelCn: "脆骨之术",
    desc: "魔法侵蝕盔甲，防禦-30%。", descEn: "Magic erodes your armor. DEF -30%.", descCn: "魔法侵蚀盔甲，防御-30%。",
    icon: "🦴",
    type: "negative",
    playerDefMult: 0.70,
  },
  {
    id: "hunger",
    label: "飢餓試煉", labelEn: "Hunger Trial", labelCn: "饥饿试炼",
    desc: "波次之間無法回復HP，考驗耐力。", descEn: "No HP recovery between waves. Test your endurance.", descCn: "波次之间无法回复HP，考验耐力。",
    icon: "🍃",
    type: "negative",
    noWaveHeal: true,
  },
  {
    id: "elite_horde",
    label: "精英湧現", labelEn: "Elite Horde", labelCn: "精英涌现",
    desc: "敵人全員強化，怪物HP+45%。", descEn: "Enemies are tougher. Monster HP +45%.", descCn: "敌人全员强化，怪物HP+45%。",
    icon: "👿",
    type: "negative",
    monsterHpMult: 1.45,
  },
  {
    id: "poison_fog",
    label: "毒霧瀰漫", labelEn: "Poison Fog", labelCn: "毒雾弥漫",
    desc: "毒霧降低戰鬥力，攻擊和防禦各-20%。", descEn: "Toxic fog weakens you. ATK & DEF both -20%.", descCn: "毒雾降低战斗力，攻击和防御各-20%。",
    icon: "🌫",
    type: "negative",
    playerAtkMult: 0.80,
    playerDefMult: 0.80,
  },
  // ── Mixed ─────────────────────────────────────────────────────
  {
    id: "glass_cannon",
    label: "玻璃大炮", labelEn: "Glass Cannon", labelCn: "玻璃大炮",
    desc: "攻擊+60%，但防禦-45%。全力進攻，毫無防備！", descEn: "ATK +60% but DEF -45%. All offense, zero defense!", descCn: "攻击+60%，但防御-45%。全力进攻，毫无防备！",
    icon: "💥",
    type: "mixed",
    playerAtkMult: 1.60,
    playerDefMult: 0.55,
  },
  {
    id: "iron_will",
    label: "鋼鐵意志", labelEn: "Iron Will", labelCn: "钢铁意志",
    desc: "HP+70%但攻擊-25%。以命換命的打法。", descEn: "HP +70% but ATK -25%. Survive at all costs.", descCn: "HP+70%但攻击-25%。以命换命的打法。",
    icon: "🏋",
    type: "mixed",
    playerHpMult: 1.70,
    playerAtkMult: 0.75,
  },
  {
    id: "high_stakes",
    label: "豪賭時刻", labelEn: "High Stakes", labelCn: "豪赌时刻",
    desc: "EXP和金幣+100%，但怪物HP+60%。高風險高回報！", descEn: "EXP & Gold +100% but monster HP +60%. High risk, high reward!", descCn: "EXP和金币+100%，但怪物HP+60%。高风险高回报！",
    icon: "🎲",
    type: "mixed",
    expMult: 2.0,
    goldMult: 2.0,
    monsterHpMult: 1.60,
  },
  {
    id: "elite_hunter",
    label: "精英獵人", labelEn: "Elite Hunter", labelCn: "精英猎人",
    desc: "金幣+50%，但怪物HP+50%。難度提升，收穫也更豐！", descEn: "Gold +50% but monster HP +50%. Harder foes, bigger reward.", descCn: "金币+50%，但怪物HP+50%。难度提升，收获也更丰！",
    icon: "🏹",
    type: "mixed",
    goldMult: 1.5,
    monsterHpMult: 1.5,
  },
  {
    id: "battle_frenzy",
    label: "戰鬥狂熱", labelEn: "Battle Frenzy", labelCn: "战斗狂热",
    desc: "攻擊和防禦+30%，但波次間無法回復HP。", descEn: "ATK & DEF +30% but no HP recovery between waves.", descCn: "攻击和防御+30%，但波次间无法回复HP。",
    icon: "🔥",
    type: "mixed",
    playerAtkMult: 1.30,
    playerDefMult: 1.30,
    noWaveHeal: true,
  },
];

export function rollDungeonModifier(): DungeonModifier {
  return DUNGEON_MODIFIERS[Math.floor(Math.random() * DUNGEON_MODIFIERS.length)];
}
