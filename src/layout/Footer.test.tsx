import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { Footer } from "./Footer";

it("renders the coffee footer link", () => {
  render(<Footer />);
  expect(screen.getByRole("link", { name: "☕ Buy the developer a coffee!" })).toHaveAttribute("href", "https://buymeacoffee.com/ssps6210noa");
});
