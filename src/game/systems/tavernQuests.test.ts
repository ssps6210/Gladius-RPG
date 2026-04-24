import { describe, expect, it } from "vitest";
import {
  abandonTavernQuest,
  acceptTavernQuest,
  applyTavernKillProgress,
  claimTavernQuestReward,
  createInitialTavernQuestState,
  refreshTavernBoard,
} from "./tavernQuests";
import type { TavernQuestState } from "../types/tavern";

function mockActiveQuestState(): TavernQuestState {
  return {
    board: [{
      id: "wolf_hunt",
      reqLv: 1,
      targetMonster: "wolf",
      reqCount: 5,
      reward: { gold: 50, exp: 30 },
      title: "討伐餓狼",
      icon: "🐺",
      lore: "測試用任務背景",
      hint: "前往地下城",
      conclusion: "你完成了任務",
    }],
    activeQuestId: "wolf_hunt",
    accepted: { wolf_hunt: { accepted: true, concluded: false, baseKills: 0 } },
    progress: { wolf: 0 },
    storyReward: null,
  };
}

function mockCompletedQuestState(): TavernQuestState {
  return {
    board: [{
      id: "wolf_hunt",
      reqLv: 1,
      targetMonster: "wolf",
      reqCount: 2,
      reward: { gold: 50, exp: 30 },
      title: "討伐餓狼",
      icon: "🐺",
      lore: "測試用任務背景",
      hint: "前往地下城",
      conclusion: "你完成了任務",
    }],
    activeQuestId: "wolf_hunt",
    accepted: { wolf_hunt: { accepted: true, concluded: false, baseKills: 0 } },
    progress: { wolf: 5 },
    storyReward: null,
  };
}

describe("tavern quests", () => {
  it("creates an initial board from eligible quests", () => {
    const state = createInitialTavernQuestState(3, () => 0.25);

    expect(state.board.length).toBeGreaterThan(0);
    expect(state.board.length).toBeLessThanOrEqual(4);
    expect(state.board.every((quest) => quest.reqLv <= 3)).toBe(true);
  });

  it("accepts a quest and snapshots base kill counter", () => {
    const state = {
      ...mockActiveQuestState(),
      activeQuestId: null,
      progress: { wolf: 4 },
      accepted: {},
    };

    const acceptedState = acceptTavernQuest(state, "wolf_hunt");
    expect(acceptedState.activeQuestId).toBe("wolf_hunt");
    expect(acceptedState.accepted.wolf_hunt).toEqual({ accepted: true, concluded: false, baseKills: 4 });
  });

  it("increments progress from structured kill records", () => {
    const state = applyTavernKillProgress(mockActiveQuestState(), [{ enemyId: "wolf", enemyName: "餓狼", count: 2 }]);
    expect(state.progress.wolf).toBe(2);
  });

  it("blocks reward claim until quest target is met", () => {
    const result = claimTavernQuestReward({
      ...mockCompletedQuestState(),
      progress: { wolf: 1 },
    });

    expect(result.storyReward).toBeNull();
    expect(result.activeQuestId).toBe("wolf_hunt");
  });

  it("creates story reward state when claiming a completed quest", () => {
    const result = claimTavernQuestReward(mockCompletedQuestState());

    expect(result.storyReward?.title).toBeTruthy();
    expect(result.storyReward?.conclusion).toBeTruthy();
    expect(result.activeQuestId).toBeNull();
    expect(result.accepted.wolf_hunt).toEqual({ accepted: true, concluded: true, baseKills: 0 });
    expect(result.board.some((quest) => quest.id === "wolf_hunt")).toBe(false);
  });

  it("abandons an accepted quest", () => {
    const state = mockCompletedQuestState();
    const result = abandonTavernQuest(state, "wolf_hunt");

    expect(result.activeQuestId).toBeNull();
    expect(result.accepted.wolf_hunt).toBeUndefined();
  });

  it("refreshes board while keeping current active quest", () => {
    const state = mockActiveQuestState();
    const result = refreshTavernBoard(state, 5, () => 0.8);

    expect(result.board.length).toBeGreaterThan(0);
    expect(result.board.some((quest) => quest.id === "wolf_hunt")).toBe(true);
  });
});
