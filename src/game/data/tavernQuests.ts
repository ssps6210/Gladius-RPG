export interface TavernQuestDef {
  id: string;
  reqLv: number;
  targetMonster: string;
  reqCount: number;
  title: string;
  icon: string;
  lore: string;
  hint: string;
  conclusion: string;
  reward: { gold: number; exp: number };
}

export const TAVERN_QUEST_DEFS: TavernQuestDef[] = [
  {
    id: "wolf_hunt",
    reqLv: 1,
    targetMonster: "wolf",
    reqCount: 5,
    title: "討伐餓狼",
    icon: "🐺",
    lore: "幾名伐木工在森林邊緣被狼群襲擊，酒館懸賞勇者前往清剿。",
    hint: "前往【地下城】初階區域狩獵餓狼",
    conclusion: "你清除了附近的狼群，村民們感謝你的英勇。",
    reward: { gold: 80, exp: 50 },
  },
  {
    id: "goblin_raid",
    reqLv: 3,
    targetMonster: "goblin",
    reqCount: 8,
    title: "哥布林掃蕩",
    icon: "👺",
    lore: "礦坑與農路遭地精騷擾，村長募集賞金請你清理巢穴。",
    hint: "前往【地下城】中階波次擊殺哥布林",
    conclusion: "哥布林部落已被驅散，商路再度暢通。",
    reward: { gold: 120, exp: 80 },
  },
  {
    id: "skeleton_purge",
    reqLv: 5,
    targetMonster: "skeleton",
    reqCount: 6,
    title: "淨化亡骸",
    icon: "💀",
    lore: "墓園異變，亡骸士兵夜間遊蕩。神職者請求協助鎮壓。",
    hint: "前往【地下城】高階波次討伐骷髏",
    conclusion: "骷髏士兵已被消滅，古墓重歸寧靜。",
    reward: { gold: 100, exp: 70 },
  },
];
