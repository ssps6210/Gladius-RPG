export const EQUIPMENT_SLOT_IDS = [
  "weapon",
  "offhand",
  "helmet",
  "armor",
  "gloves",
  "boots",
  "ring",
  "amulet",
] as const;

export type EquipmentSlotId = (typeof EQUIPMENT_SLOT_IDS)[number];
