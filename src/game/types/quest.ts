export type RuntimeQuestProgressEntry = {
  collected: boolean;
  baseVal: number;
};

export type RuntimeQuestState = {
  progress: Record<string, RuntimeQuestProgressEntry>;
  dailyDate: string;
  weeklyDate: string;
};
