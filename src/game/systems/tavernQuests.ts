import type { KillRecord } from "../types/combat";
import { TAVERN_QUEST_DEFS } from "../data/tavernQuests";
import type { StoryRewardState, TavernQuestBoardItem, TavernQuestState } from "../types/tavern";

function pickBoardSize(eligibleCount: number, randomFn: () => number): number {
  if (eligibleCount <= 0) return 0;
  if (eligibleCount <= 3) return eligibleCount;
  return randomFn() < 0.5 ? 3 : 4;
}

export function generateTavernBoard(playerLevel: number, randomFn: () => number = Math.random): TavernQuestBoardItem[] {
  const eligible = TAVERN_QUEST_DEFS.filter((quest) => quest.reqLv <= playerLevel);
  const boardSize = Math.min(eligible.length, pickBoardSize(eligible.length, randomFn));
  const pool = [...eligible];
  const board: TavernQuestBoardItem[] = [];

  while (board.length < boardSize && pool.length > 0) {
    const pickIndex = Math.floor(randomFn() * pool.length);
    const [picked] = pool.splice(pickIndex, 1);
    if (picked) {
      board.push(picked);
    }
  }

  return board;
}

export function createInitialTavernQuestState(playerLevel: number, randomFn: () => number = Math.random): TavernQuestState {
  return {
    board: generateTavernBoard(playerLevel, randomFn),
    activeQuestId: null,
    accepted: {},
    progress: {},
    storyReward: null,
  };
}

export function refreshTavernBoard(state: TavernQuestState, playerLevel: number, randomFn: () => number = Math.random): TavernQuestState {
  const refreshedBoard = generateTavernBoard(playerLevel, randomFn);

  if (!state.activeQuestId) {
    return { ...state, board: refreshedBoard };
  }

  const activeQuest = state.board.find((quest) => quest.id === state.activeQuestId);
  if (!activeQuest || refreshedBoard.some((quest) => quest.id === activeQuest.id)) {
    return { ...state, board: refreshedBoard };
  }

  return { ...state, board: [activeQuest, ...refreshedBoard] };
}

export function acceptTavernQuest(state: TavernQuestState, questId: string): TavernQuestState {
  const quest = state.board.find((entry) => entry.id === questId);
  if (!quest) {
    return state;
  }

  const baseKills = state.progress[quest.targetMonster] ?? 0;

  return {
    ...state,
    activeQuestId: questId,
    accepted: {
      ...state.accepted,
      [questId]: { accepted: true, concluded: false, baseKills },
    },
  };
}

export function abandonTavernQuest(state: TavernQuestState, questId: string): TavernQuestState {
  if (!(questId in state.accepted) && state.activeQuestId !== questId) {
    return state;
  }

  const accepted = { ...state.accepted };
  delete accepted[questId];

  return {
    ...state,
    activeQuestId: state.activeQuestId === questId ? null : state.activeQuestId,
    accepted,
  };
}

export function applyTavernKillProgress(state: TavernQuestState, kills: KillRecord[]): TavernQuestState {
  if (!state.activeQuestId) return state;
  const progress = { ...state.progress };
  for (const kill of kills) {
    progress[kill.enemyId] = (progress[kill.enemyId] ?? 0) + kill.count;
  }
  return { ...state, progress };
}

export function claimTavernQuestReward(state: TavernQuestState): TavernQuestState {
  if (!state.activeQuestId) return state;
  const quest = state.board.find((entry) => entry.id === state.activeQuestId);
  if (!quest) return state;

  const accepted = state.accepted[quest.id];
  if (!accepted?.accepted) return state;

  const currentKills = state.progress[quest.targetMonster] ?? 0;
  if (currentKills - accepted.baseKills < quest.reqCount) return state;

  const storyReward: StoryRewardState = {
    title: quest.title,
    icon: quest.icon,
    conclusion: quest.conclusion,
    reward: quest.reward,
  };

  return {
    ...state,
    board: state.board.filter((entry) => entry.id !== quest.id),
    activeQuestId: null,
    accepted: {
      ...state.accepted,
      [quest.id]: { ...accepted, concluded: true },
    },
    storyReward,
  };
}

export function dismissStoryReward(state: TavernQuestState): TavernQuestState {
  return { ...state, storyReward: null };
}
