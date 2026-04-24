import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { BattleReport } from "./BattleReport";

it("renders the completed replay summary and wired actions", () => {
  const replay = {
    cursor: 2,
    drops: [],
    lines: [
      { txt: "戰鬥開始", type: "title" },
      { txt: "你擊敗了敵人", type: "win" },
    ],
  };
  const replaySummary = {
    actionLabel: "⚔ 再次出征",
    progressBackground: "linear-gradient(90deg,#1a5a1a,#40a040)",
    progressWidth: "100%",
    showBattleSummary: true,
    statusText: "— 戰鬥結束 —",
    title: "🏟 競技場 · 對手",
  };
  const onClose = vi.fn();
  const onRestart = vi.fn();
  const onSkip = vi.fn();

  render(
    <BattleReport
      replay={replay}
      replaySummary={replaySummary}
      onClose={onClose}
      onRestart={onRestart}
      onSkip={onSkip}
    />,
  );

  expect(screen.getByText("🏟 競技場 · 對手")).toBeInTheDocument();
  expect(screen.getByText("戰鬥摘要")).toBeInTheDocument();
  expect(screen.getAllByText("你擊敗了敵人")).toHaveLength(2);

  fireEvent.click(screen.getByRole("button", { name: "⚔ 再次出征" }));
  fireEvent.click(screen.getByRole("button", { name: "↩ 返回" }));

  expect(onRestart).toHaveBeenCalledTimes(1);
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onSkip).not.toHaveBeenCalled();
});
