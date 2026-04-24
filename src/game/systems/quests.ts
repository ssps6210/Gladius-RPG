import { QUEST_DEFS } from "../data/quests";

export function getWeekKey() {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);

  return `${d.getFullYear()}-W${week}`;
}

export function initQuestState() {
  const today = new Date().toISOString().slice(0, 10);
  const week = getWeekKey();
  const progress: Record<string, { collected: boolean; baseVal: number }> = {};

  Object.keys(QUEST_DEFS).forEach((id) => {
    progress[id] = { collected: false, baseVal: 0 };
  });

  return { progress, dailyDate: today, weeklyDate: week };
}

export function getQuestProgress(questId: any, playerStats: any, questState: any) {
  const def = QUEST_DEFS[questId];

  if (!def) return 0;

  const base = (questState.progress[questId] && questState.progress[questId].baseVal) || 0;
  const current = playerStats[def.field] || 0;

  return current - base;
}

export function isQuestDone(questId: any, playerStats: any, questState: any) {
  const def = QUEST_DEFS[questId];

  if (!def) return false;
  if (questState.progress[questId] && questState.progress[questId].collected) return false;

  if (def.special === "enh7") {
    const equip = playerStats.equipment || {};

    return Object.values(equip).some((entry) => {
      const item = entry as any;
      return item && (item.enhLv || 0) >= 7;
    });
  }

  if (def.special === "3mythic") {
    const equip = playerStats.equipment || {};
    const inv = playerStats._inv || [];
    const mythicCount =
      Object.values(equip).filter((entry) => {
        const item = entry as any;
        return item && item.rarity === "mythic";
      }).length + inv.filter((item: any) => item.rarity === "mythic").length;

    return mythicCount >= 3;
  }

  return getQuestProgress(questId, playerStats, questState) >= def.target;
}

export function checkQuestReset(questState: any, player: any): any {
  const today = new Date().toISOString().slice(0, 10);
  const week = getWeekKey();
  let newQs = { ...questState, progress: { ...questState.progress } };
  let changed = false;

  if (questState.dailyDate !== today) {
    Object.keys(QUEST_DEFS).forEach((id) => {
      if (QUEST_DEFS[id].cat === "daily") {
        newQs.progress[id] = { collected: false, baseVal: player[QUEST_DEFS[id].field] || 0 };
      }
    });
    newQs.dailyDate = today;
    changed = true;
  }

  if (questState.weeklyDate !== week) {
    Object.keys(QUEST_DEFS).forEach((id) => {
      if (QUEST_DEFS[id].cat === "weekly") {
        newQs.progress[id] = { collected: false, baseVal: player[QUEST_DEFS[id].field] || 0 };
      }
    });
    newQs.weeklyDate = week;
    changed = true;
  }

  return changed ? newQs : questState;
}
