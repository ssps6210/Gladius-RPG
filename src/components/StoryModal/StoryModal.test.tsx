import { render, screen, cleanup } from "@testing-library/react";
import { it, expect, afterEach } from "vitest";
import { StoryModal } from "./StoryModal";

afterEach(cleanup);

it("renders the upstream heading and action text", () => {
  render(<StoryModal story={{ title: "討伐完成", icon: "🗡", conclusion: "故事結尾", reward: { gold: 10, exp: 20 } }} />);
  expect(screen.getByText("QUEST COMPLETE")).toBeInTheDocument();
  expect(screen.getByText("收下賞金，離開酒館")).toBeInTheDocument();
});

it("uses the final upstream heading and confirm text", () => {
  render(<StoryModal story={{ title: "完成", icon: "🏆", conclusion: "結語", reward: { gold: 1, exp: 1 } }} />);
  expect(screen.getByText("QUEST COMPLETE")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "收下賞金，離開酒館" })).toBeInTheDocument();
});
