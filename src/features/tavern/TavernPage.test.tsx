import { fireEvent, render, screen } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import { TavernPage } from "./TavernPage";

it("renders the inn panel and tavern board controls", () => {
  const onRefresh = vi.fn();
  render(
    <TavernPage
      player={{ hp: 40, maxHp: 100 }}
      recovery={{ dungeonInjuredUntil: Date.now() + 60_000, arenaInjuredUntil: 0 }}
      restCost={50}
      board={[]}
      activeQuestId={null}
      accepted={{}}
      progress={{}}
      onRest={vi.fn()}
      onRefresh={onRefresh}
      onAcceptQuest={vi.fn()}
      onClaimQuest={vi.fn()}
      onAbandonQuest={vi.fn()}
    />,
  );

  expect(screen.getByText("酒館旅店")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "🔄 刷新告示板" }));
  expect(onRefresh).toHaveBeenCalledTimes(1);
});

it("dispatches tavern quest actions from board cards", () => {
  const onAcceptQuest = vi.fn();
  const onClaimQuest = vi.fn();
  const onAbandonQuest = vi.fn();
  const now = Date.now();

  render(
    <TavernPage
      player={{ hp: 100, maxHp: 100 }}
      recovery={{ dungeonInjuredUntil: now - 1, arenaInjuredUntil: now - 1 }}
      restCost={80}
      board={[
        {
          id: "wolf_hunt",
          reqLv: 1,
          targetMonster: "wolf",
          reqCount: 2,
          title: "討伐餓狼",
          icon: "🐺",
          lore: "測試背景",
          hint: "前往地下城",
          conclusion: "任務完成",
          reward: { gold: 80, exp: 50 },
        },
      ]}
      activeQuestId={"wolf_hunt"}
      accepted={{ wolf_hunt: { accepted: true, concluded: false, baseKills: 0 } }}
      progress={{ wolf: 2 }}
      onRest={vi.fn()}
      onRefresh={vi.fn()}
      onAcceptQuest={onAcceptQuest}
      onClaimQuest={onClaimQuest}
      onAbandonQuest={onAbandonQuest}
    />,
  );

  fireEvent.click(screen.getByRole("button", { name: "領取賞金" }));
  expect(onClaimQuest).toHaveBeenCalledWith("wolf_hunt");

  fireEvent.click(screen.getByRole("button", { name: "放棄" }));
  expect(onAbandonQuest).toHaveBeenCalledWith("wolf_hunt");

  fireEvent.click(screen.getByRole("button", { name: "接取任務" }));
  expect(onAcceptQuest).toHaveBeenCalledWith("wolf_hunt");
});
