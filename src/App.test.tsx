import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

vi.mock("./game/GameApp", () => ({
  default: () => <div>game-shell</div>,
}));

import App from "./App";

it("renders the coffee footer link in the active app shell", () => {
  render(<App />);

  expect(screen.getByRole("link", { name: "☕ Buy the developer a coffee!" })).toHaveAttribute(
    "href",
    "https://buymeacoffee.com/ssps6210noa",
  );
});
