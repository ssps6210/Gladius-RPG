import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { DungeonTab } from "./DungeonTab";

it("renders dungeon sections and mercenary empty state", () => {
  render(
    <DungeonTab
      expeditionCards={[]}
      dungeonSections={[]}
      mercScrollsInInv={[]}
      mercSelectionCards={[]}
      selectedScrolls={[]}
      mercDungeonCards={[]}
      onAddFreeMercScroll={() => {}}
    />,
  );

  expect(screen.getByText("🗺 探險 — 單怪快速戰鬥")).toBeInTheDocument();
  expect(screen.getByText("⚔️ 副本 — 多波怪物＋Boss")).toBeInTheDocument();
  expect(screen.getByText("🏴 傭兵副本 — 契約捲軸系統")).toBeInTheDocument();
  expect(screen.getByText("背包中沒有傭兵契約捲軸")).toBeInTheDocument();
  expect(screen.getByText("🎲 購買隨機捲軸（免費測試）")).toBeInTheDocument();
});
