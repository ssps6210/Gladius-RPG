export type JobClassId = "warrior" | "bard" | "cleric" | "rogue";

export interface JobClass {
  id: JobClassId;
  name: string;
  nameEn: string;
  icon: string;
  desc: string;
  descEn: string;
  atkBonus: number;
  defBonus: number;
  hpPct: number;
  spdBonus: number;
}

export const JOB_CLASSES: Record<JobClassId, JobClass> = {
  warrior: {
    id: "warrior", name: "戰士", nameEn: "Warrior", icon: "⚔️",
    atkBonus: 20, defBonus: 15, hpPct: 10, spdBonus: 0,
    desc: "+20攻擊 +15防禦 +10%HP，受擊時15%機率格擋，傷害減半。",
    descEn: "+20 ATK +15 DEF +10% HP. 15% chance to block, halving incoming damage.",
  },
  bard: {
    id: "bard", name: "吟遊詩人", nameEn: "Bard", icon: "🎵",
    atkBonus: 5, defBonus: 0, hpPct: 0, spdBonus: 20,
    desc: "+5攻擊 +20速度，每回合20%機率旋律激勵，跳過敵方攻擊。",
    descEn: "+5 ATK +20 SPD. Each round, 20% chance to Inspire and skip enemy attack.",
  },
  cleric: {
    id: "cleric", name: "聖職者", nameEn: "Cleric", icon: "✝️",
    atkBonus: 0, defBonus: 10, hpPct: 30, spdBonus: 0,
    desc: "+30%最大HP +10防禦，每回合神聖回復8HP。",
    descEn: "+30% Max HP +10 DEF. Regenerates 8 HP per round.",
  },
  rogue: {
    id: "rogue", name: "強盜", nameEn: "Rogue", icon: "🗡️",
    atkBonus: 15, defBonus: 0, hpPct: 0, spdBonus: 5,
    desc: "+15攻擊 +5速度，首回合必定爆擊，爆擊率+15%。",
    descEn: "+15 ATK +5 SPD. First round always crits. +15% bonus crit chance.",
  },
};

export const JOB_CLASS_LIST: JobClass[] = Object.values(JOB_CLASSES);
