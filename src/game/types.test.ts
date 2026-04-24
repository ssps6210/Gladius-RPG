import { describe, expect, it } from "vitest";

import { EQUIPMENT_SLOT_IDS as shimSlots } from "./types";
import { EQUIPMENT_SLOT_IDS as sharedSlots } from "./types/shared";

describe("game type module exports", () => {
  it("keeps the compatibility shim aligned with the split shared module", () => {
    expect(shimSlots).toEqual(sharedSlots);
    expect(shimSlots).toEqual([
      "weapon",
      "offhand",
      "helmet",
      "armor",
      "gloves",
      "boots",
      "ring",
      "amulet",
    ]);
  });
});
