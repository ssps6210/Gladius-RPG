export interface StoryRewardState {
  title: string;
  icon: string;
  conclusion: string;
  reward: { gold: number; exp: number };
}

export interface TavernQuestReward {
  gold: number;
  exp: number;
}

export interface TavernQuestBoardItem {
  id: string;
  reqLv: number;
  targetMonster: string;
  reqCount: number;
  title: string;
  icon: string;
  lore: string;
  hint: string;
  conclusion: string;
  reward: TavernQuestReward;
}

export interface TavernQuestAcceptedState {
  accepted: boolean;
  concluded: boolean;
  baseKills: number;
}

export interface TavernQuestState {
  board: TavernQuestBoardItem[];
  activeQuestId: string | null;
  accepted: Record<string, TavernQuestAcceptedState>;
  progress: Record<string, number>;
  storyReward: StoryRewardState | null;
}
