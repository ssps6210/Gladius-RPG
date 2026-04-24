import { describe, expectTypeOf, it } from "vitest";
import type { CombatResult, KillRecord } from "./combat";
import type { RecoveryState } from "./recovery";
import type { StoryRewardState, TavernQuestState } from "./tavern";

describe("upstream absorption shared types", () => {
  const _tavernStateShapeCheck: TavernQuestState = {
    board: [],
    activeQuestId: null,
    accepted: {},
    progress: {},
    storyReward: null,
  };

  void _tavernStateShapeCheck;

  it("exposes combat result records for downstream systems", () => {
    expectTypeOf<CombatResult>().toMatchTypeOf<{
      outcome: "win" | "loss" | "draw";
      kills: KillRecord[];
      rewards: { exp: number; gold: number };
    }>();
  });

  it("exposes independent recovery timestamps", () => {
    expectTypeOf<RecoveryState>().toMatchTypeOf<{
      dungeonInjuredUntil: number;
      arenaInjuredUntil: number;
    }>();
  });

  it("exposes tavern quest and story reward state", () => {
    expectTypeOf<TavernQuestState>().toMatchTypeOf<{
      board: Array<{
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
      }>;
      activeQuestId: string | null;
      accepted: Record<string, { accepted: boolean; concluded: boolean; baseKills: number }>;
      progress: Record<string, number>;
      storyReward: StoryRewardState | null;
    }>();
    expectTypeOf<StoryRewardState>().toMatchTypeOf<{
      title: string;
      icon: string;
      conclusion: string;
      reward: { gold: number; exp: number };
    }>();
  });
});
