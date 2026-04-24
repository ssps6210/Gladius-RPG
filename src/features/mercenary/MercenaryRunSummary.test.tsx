import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { MercenaryRunSummary } from "./MercenaryRunSummary";

it("renders survivor and summary information", () => {
  render(<MercenaryRunSummary result={{ survivors: 2, summary: ["第一波勝利"] }} />);
  expect(screen.getByText(/2/)).toBeInTheDocument();
  expect(screen.getByText("第一波勝利")).toBeInTheDocument();
});
