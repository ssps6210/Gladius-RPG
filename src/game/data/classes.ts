export type JobClassId =
  | "warrior" | "bard" | "cleric" | "rogue"
  | "berserker" | "paladin"
  | "assassin" | "shadowFiend"
  | "archbishop" | "inquisitor"
  | "shadowDancer" | "spellsinger";

export interface JobClass {
  id: JobClassId;
  name: string;
  nameEn: string;
  icon: string;
  portrait: string;
  desc: string;
  descEn: string;
  atkBonus: number;
  defBonus: number;
  hpPct: number;
  spdBonus: number;
  tier: 1 | 2;
  prereq?: JobClassId;
  reqLevel: number;
}

export const GLADIATOR_PORTRAIT = "./portraits/Gladiator.jpg";

export const JOB_CLASSES: Record<JobClassId, JobClass> = {
  // ── Tier 1 (Lv.30) ─────────────────────────────────────────────────────
  warrior: {
    id: "warrior", tier: 1, reqLevel: 30,
    name: "戰士", nameEn: "Warrior", icon: "⚔️",
    portrait: "./portraits/Warrior.png",
    atkBonus: 20, defBonus: 15, hpPct: 10, spdBonus: 0,
    desc: "+20攻擊 +15防禦 +10%HP，受擊時15%機率格擋，傷害減半。",
    descEn: "+20 ATK +15 DEF +10% HP. 15% chance to block, halving incoming damage.",
  },
  bard: {
    id: "bard", tier: 1, reqLevel: 30,
    name: "吟遊詩人", nameEn: "Bard", icon: "🎵",
    portrait: "./portraits/Bard.png",
    atkBonus: 5, defBonus: 0, hpPct: 0, spdBonus: 20,
    desc: "+5攻擊 +20速度，每回合20%機率旋律激勵，跳過敵方攻擊。",
    descEn: "+5 ATK +20 SPD. 20% chance each round to Inspire, skipping enemy attack.",
  },
  cleric: {
    id: "cleric", tier: 1, reqLevel: 30,
    name: "聖職者", nameEn: "Cleric", icon: "✝️",
    portrait: "./portraits/Cleric.jpg",
    atkBonus: 0, defBonus: 10, hpPct: 30, spdBonus: 0,
    desc: "+30%最大HP +10防禦，每回合神聖回復8HP。",
    descEn: "+30% Max HP +10 DEF. Regenerates 8 HP per round.",
  },
  rogue: {
    id: "rogue", tier: 1, reqLevel: 30,
    name: "強盜", nameEn: "Rogue", icon: "🗡️",
    portrait: "./portraits/Rogue.jpg",
    atkBonus: 15, defBonus: 0, hpPct: 0, spdBonus: 5,
    desc: "+15攻擊 +5速度，首回合必定爆擊，爆擊率+15%。",
    descEn: "+15 ATK +5 SPD. First round always crits. +15% bonus crit chance.",
  },

  // ── Tier 2 (Lv.70) ─────────────────────────────────────────────────────
  berserker: {
    id: "berserker", tier: 2, reqLevel: 70, prereq: "warrior",
    name: "狂戰士", nameEn: "Berserker", icon: "🔥",
    portrait: "./portraits/Berserker1.png",
    atkBonus: 50, defBonus: -10, hpPct: 5, spdBonus: 10,
    desc: "+50攻擊 -10防禦 +5%HP +10速度。被動：HP低於30%時攻擊力翻倍。",
    descEn: "+50 ATK -10 DEF +5% HP +10 SPD. Passive: ATK doubles when HP < 30%.",
  },
  paladin: {
    id: "paladin", tier: 2, reqLevel: 70, prereq: "warrior",
    name: "聖騎士", nameEn: "Paladin", icon: "🛡",
    portrait: "./portraits/Warrior.png",
    atkBonus: 25, defBonus: 30, hpPct: 20, spdBonus: 0,
    desc: "+25攻擊 +30防禦 +20%HP。格擋率提升至30%，格擋時反彈30%傷害給敵方。",
    descEn: "+25 ATK +30 DEF +20% HP. 30% block; reflect 30% damage on block.",
  },
  assassin: {
    id: "assassin", tier: 2, reqLevel: 70, prereq: "rogue",
    name: "暗殺者", nameEn: "Assassin", icon: "💀",
    portrait: "./portraits/Rogue.jpg",
    atkBonus: 30, defBonus: 0, hpPct: 0, spdBonus: 15,
    desc: "+30攻擊 +15速度，首回合必定爆擊，爆擊率+20%，爆擊傷害×3.5。",
    descEn: "+30 ATK +15 SPD. First round crits. +20% crit chance. Crit deals ×3.5.",
  },
  shadowFiend: {
    id: "shadowFiend", tier: 2, reqLevel: 70, prereq: "rogue",
    name: "影魔", nameEn: "Shadow Fiend", icon: "🌑",
    portrait: "./portraits/Rogue.jpg",
    atkBonus: 25, defBonus: 0, hpPct: 15, spdBonus: 20,
    desc: "+25攻擊 +20速度 +15%HP。每次攻擊吸取造成傷害的20%為HP。",
    descEn: "+25 ATK +20 SPD +15% HP. Each hit, steal 20% of damage dealt as HP.",
  },
  archbishop: {
    id: "archbishop", tier: 2, reqLevel: 70, prereq: "cleric",
    name: "大主教", nameEn: "Archbishop", icon: "☀️",
    portrait: "./portraits/Cleric.jpg",
    atkBonus: 0, defBonus: 15, hpPct: 60, spdBonus: 0,
    desc: "+60%最大HP +15防禦。每回合回復最大HP的5%（上限999）。",
    descEn: "+60% Max HP +15 DEF. Regen 5% of max HP per round.",
  },
  inquisitor: {
    id: "inquisitor", tier: 2, reqLevel: 70, prereq: "cleric",
    name: "神裁官", nameEn: "Inquisitor", icon: "⚡",
    portrait: "./portraits/Cleric.jpg",
    atkBonus: 30, defBonus: 10, hpPct: 20, spdBonus: 0,
    desc: "+30攻擊 +10防禦 +20%HP。每回合20%機率觸發神聖審判，造成雙倍傷害。",
    descEn: "+30 ATK +10 DEF +20% HP. 20% chance per round to trigger Holy Wrath (×2 damage).",
  },
  shadowDancer: {
    id: "shadowDancer", tier: 2, reqLevel: 70, prereq: "bard",
    name: "影舞者", nameEn: "Shadow Dancer", icon: "🌀",
    portrait: "./portraits/Bard.png",
    atkBonus: 20, defBonus: 0, hpPct: 0, spdBonus: 40,
    desc: "+20攻擊 +40速度。每回合30%機率完全閃避敵方攻擊。",
    descEn: "+20 ATK +40 SPD. 30% chance each round to fully dodge the enemy attack.",
  },
  spellsinger: {
    id: "spellsinger", tier: 2, reqLevel: 70, prereq: "bard",
    name: "法術詩人", nameEn: "Spellsinger", icon: "🔮",
    portrait: "./portraits/Spellsinger.jpg",
    atkBonus: 30, defBonus: 5, hpPct: 0, spdBonus: 15,
    desc: "+30攻擊 +5防禦 +15速度。每3回合施放奧術爆發，額外造成攻擊力×1.5傷害。",
    descEn: "+30 ATK +5 DEF +15 SPD. Every 3 rounds, deal bonus arcane damage equal to ATK×1.5.",
  },
};

export const JOB_CLASS_LIST: JobClass[] = Object.values(JOB_CLASSES);
export const TIER1_CLASSES = JOB_CLASS_LIST.filter(c => c.tier === 1);
export const TIER2_CLASSES = JOB_CLASS_LIST.filter(c => c.tier === 2);
