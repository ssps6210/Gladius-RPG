import { render, screen } from "@testing-library/react";
import { expect, it, vi, beforeEach } from "vitest";

vi.mock("./game/GameApp", () => ({
  default: () => <div>game-shell</div>,
}));

// Pre-select slot 1 so App skips SaveSlotSelect and renders GameApp + Footer
beforeEach(() => {
  localStorage.setItem("gladius_slot", "1");
});

import App from "./App";

it("renders the coffee footer link in the active app shell", () => {
  render(<App />);

  expect(screen.getByRole("link", { name: "☕ Buy the developer a coffee!" })).toHaveAttribute(
    "href",
    "https://buymeacoffee.com/ssps6210noa",
  );
});
