import { afterEach, describe, expect, it, vi } from "vitest";

import { QUEST_DEFS } from "../data/quests";
import { checkQuestReset, getQuestProgress, getWeekKey, initQuestState, isQuestDone } from "./quests";
import * as questSystem from "./quests";

function getHelpers() {
  const helpers = questSystem as Record<string, any>;

  expect(typeof helpers.getWeekKey).toBe("function");
  expect(typeof helpers.initQuestState).toBe("function");
  expect(typeof helpers.getQuestProgress).toBe("function");
  expect(typeof helpers.isQuestDone).toBe("function");

  return helpers;
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("quest system", () => {
  it("creates the initial quest state with per-quest progress and date keys", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-23T12:00:00.000Z"));

    const { initQuestState } = getHelpers();
    const state = initQuestState();

    expect(state.dailyDate).toBe("2026-04-23");
    expect(state.weeklyDate).toBe("2026-W17");
    expect(Object.keys(state.progress)).toEqual(Object.keys(QUEST_DEFS));

    for (const id of Object.keys(QUEST_DEFS)) {
      expect(state.progress[id]).toEqual({ collected: false, baseVal: 0 });
    }
  });

  it("computes the same week key format used by the legacy UI", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00.000Z"));

    const { getWeekKey } = getHelpers();

    expect(getWeekKey()).toBe("2026-W1");
  });

  it("derives quest progress from player stats minus the stored base value", () => {
    const { getQuestProgress } = getHelpers();

    expect(
      getQuestProgress(
        "d1",
        { totalExpeditions: 9 },
        { progress: { d1: { collected: false, baseVal: 4 } } },
      ),
    ).toBe(5);
  });

  it("returns zero progress for unknown quests", () => {
    const { getQuestProgress } = getHelpers();

    expect(getQuestProgress("missing", { totalExpeditions: 9 }, { progress: {} })).toBe(0);
  });

  it("treats collected quests as incomplete even if their target is met", () => {
    const { isQuestDone } = getHelpers();

    expect(
      isQuestDone(
        "d1",
        { totalExpeditions: 10 },
        { progress: { d1: { collected: true, baseVal: 0 } } },
      ),
    ).toBe(false);
  });

  it("completes the enhancement achievement when any equipped item reaches +7", () => {
    const { isQuestDone } = getHelpers();

    expect(
      isQuestDone(
        "a9",
        {
          equipment: {
            weapon: { enhLv: 7 },
            armor: null,
          },
        },
        { progress: { a9: { collected: false, baseVal: 0 } } },
      ),
    ).toBe(true);
  });

  it("completes the mythic collector achievement across equipment and inventory", () => {
    const { isQuestDone } = getHelpers();

    expect(
      isQuestDone(
        "a10",
        {
          equipment: {
            weapon: { rarity: "mythic" },
            armor: { rarity: "mythic" },
          },
          _inv: [{ rarity: "mythic" }],
        },
        { progress: { a10: { collected: false, baseVal: 0 } } },
      ),
    ).toBe(true);
  });

  it("uses target comparison for non-special quests", () => {
    const { isQuestDone } = getHelpers();

    expect(
      isQuestDone(
        "w3",
        { totalEnhances: 10 },
        { progress: { w3: { collected: false, baseVal: 1 } } },
      ),
    ).toBe(false);
    expect(
      isQuestDone(
        "w3",
        { totalEnhances: 11 },
        { progress: { w3: { collected: false, baseVal: 1 } } },
      ),
    ).toBe(true);
  });
});

describe("checkQuestReset", () => {
  it("resets daily quest bases when the date has changed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-24T00:00:00Z"));

    const oldState = {
      dailyDate: "2026-04-23",
      weeklyDate: "2026-W17",
      progress: { d3: { collected: true, baseVal: 0 } },
    };
    const player = { totalKills: 10 };

    const newState = checkQuestReset(oldState, player);

    expect(newState.dailyDate).toBe("2026-04-24");
    expect(newState.progress.d3.collected).toBe(false);

    vi.useRealTimers();
  });

  it("returns the same object reference when nothing has changed", () => {
    vi.useFakeTimers();
    const today = "2026-04-24";
    vi.setSystemTime(new Date(`${today}T00:00:00Z`));

    const state = {
      dailyDate: today,
      weeklyDate: getWeekKey(),
      progress: { d3: { collected: false, baseVal: 0 } },
    };
    const player = { totalKills: 5 };

    const result = checkQuestReset(state, player);
    expect(result).toBe(state);

    vi.useRealTimers();
  });
});
