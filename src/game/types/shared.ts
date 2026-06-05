export const EQUIPMENT_SLOT_IDS = [
  "weapon",
  "offhand",
  "helmet",
  "armor",
  "gloves",
  "boots",
  "ring",
  "amulet",
  "weapon2",
  "ring2",
  "armor2",
] as const;

export type EquipmentSlotId = (typeof EQUIPMENT_SLOT_IDS)[number];

export const SLOT_EFFECTIVENESS: Partial<Record<EquipmentSlotId, number>> = {
  weapon2: 0.5,
  ring2: 1.0,
  armor2: 0.7,
};

export const SLOT_CLASS_UNLOCK: Partial<Record<EquipmentSlotId, string>> = {
  weapon2: "warrior",
  ring2: "bard",
  armor2: "rogue",
};

export const SLOT_BASE_TYPE: Partial<Record<EquipmentSlotId, EquipmentSlotId>> = {
  weapon2: "weapon",
  ring2: "ring",
  armor2: "armor",
};
