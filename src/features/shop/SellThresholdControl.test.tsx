import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { SellThresholdControl } from "./SellThresholdControl";

it("renders the upstream bulk sell action text", () => {
  render(<SellThresholdControl value="normal" onChange={() => {}} onSell={() => {}} />);
  expect(screen.getByText("🗑 一鍵賣出")).toBeInTheDocument();
});
