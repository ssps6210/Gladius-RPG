import {
  createInitialEquipment,
  createInitialPlayer,
  CURRENT_SAVE_VERSION,
  LEGACY_KEYS,
  getSlotKeys,
  type SaveSlot,
} from "../constants/index";
import {
  EQUIPMENT_SLOT_IDS,
  type EquipmentSlotId,
  type GameSave,
  type RuntimeEquipment,
  type RuntimeItem,
  type RuntimePlayer,
} from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveStorage(storage?: Storage): Storage | null {
  if (storage) {
    return storage;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isEquipmentSlotId(value: string): value is EquipmentSlotId {
  return EQUIPMENT_SLOT_IDS.includes(value as EquipmentSlotId);
}

function mergeEquipment(equipment: unknown): RuntimeEquipment {
  if (!isRecord(equipment)) {
    return createInitialEquipment();
  }

  const mergedEquipment = createInitialEquipment();

  for (const [slot, value] of Object.entries(equipment)) {
    if (isEquipmentSlotId(slot) && (value === null || isRecord(value))) {
      mergedEquipment[slot] = value;
    }
  }

  return mergedEquipment;
}

function mergeMonsterKills(monsterKills: unknown): Record<string, number> {
  if (!isRecord(monsterKills)) {
    return {};
  }

  const merged: Record<string, number> = {};

  for (const [enemyId, count] of Object.entries(monsterKills)) {
    if (isFiniteNumber(count)) {
      merged[enemyId] = count;
    }
  }

  return merged;
}

/**
 * Handles field renames across save versions.
 * Add a new block here whenever a player field is renamed or restructured.
 */
function migratePlayerFields(raw: Record<string, unknown>): Record<string, unknown> {
  const p = { ...raw };
  const v = typeof p.saveVersion === "number" ? p.saveVersion : 0;

  // v0 → v1: no field renames yet; just stamp the version
  if (v < 1) {
    // example of future use:
    // if ("atk_trained" in p && !("trainedAtk" in p)) { p.trainedAtk = p.atk_trained; delete p.atk_trained; }
  }

  p.saveVersion = CURRENT_SAVE_VERSION;
  return p;
}

/** Fill in safe defaults for any item fields that older saves may be missing. */
function sanitizeItem(raw: Record<string, unknown>): RuntimeItem {
  return {
    enhLv: 0,
    specials: [],
    affixes: [],
    ...raw,
  } as RuntimeItem;
}

function mergePlayer(player: unknown): RuntimePlayer {
  const initialPlayer = createInitialPlayer();

  if (!isRecord(player)) {
    return initialPlayer;
  }

  const migrated = migratePlayerFields(player);

  const mergedPlayer: RuntimePlayer = {
    ...initialPlayer,
    equipment: mergeEquipment(migrated.equipment),
    monsterKills: mergeMonsterKills(migrated.monsterKills),
  };

  for (const [key, value] of Object.entries(migrated)) {
    if (key === "equipment" || key === "monsterKills") {
      continue;
    }

    const defaultValue = initialPlayer[key as keyof RuntimePlayer];

    if (typeof defaultValue === "string" && typeof value === "string") {
      mergedPlayer[key as keyof RuntimePlayer] = value as never;
    }

    if (typeof defaultValue === "number" && isFiniteNumber(value)) {
      mergedPlayer[key as keyof RuntimePlayer] = value as never;
    }
  }

  return mergedPlayer;
}

function parsePlayer(storage: Storage | null, keys: { player: string }): RuntimePlayer {
  if (!storage) return createInitialPlayer();
  try {
    return mergePlayer(JSON.parse(storage.getItem(keys.player) ?? "null"));
  } catch {
    return createInitialPlayer();
  }
}

function parseInventory(storage: Storage | null, keys: { inventory: string }): RuntimeItem[] {
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem(keys.inventory) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter(isRecord).map(sanitizeItem)
      : [];
  } catch {
    return [];
  }
}

export function migrateLegacyToSlot1(): void {
  if (typeof window === "undefined") return;
  const s = window.localStorage;
  const slot1Keys = getSlotKeys(1);
  if (s.getItem(LEGACY_KEYS.player) && !s.getItem(slot1Keys.player)) {
    s.setItem(slot1Keys.player, s.getItem(LEGACY_KEYS.player)!);
    s.setItem(slot1Keys.inventory, s.getItem(LEGACY_KEYS.inventory) ?? "[]");
  }
  s.removeItem(LEGACY_KEYS.player);
  s.removeItem(LEGACY_KEYS.inventory);
}

export type SlotPreview = { name: string; level: number; className: string } | null;

export function getSlotPreview(slot: SaveSlot): SlotPreview {
  if (typeof window === "undefined") return null;
  try {
    const keys = getSlotKeys(slot);
    const raw = window.localStorage.getItem(keys.player);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!p || typeof p !== "object") return null;
    return {
      name: typeof p.name === "string" ? p.name : "角鬥士",
      level: typeof p.level === "number" ? p.level : 1,
      className: typeof p.jobClass === "string" ? p.jobClass : "",
    };
  } catch {
    return null;
  }
}

export function migrateGameState(save: {
  player?: unknown;
  inventory?: unknown;
}): GameSave {
  return {
    player: mergePlayer(save.player),
    inventory: Array.isArray(save.inventory)
      ? save.inventory.filter((entry): entry is RuntimeItem => isRecord(entry))
      : [],
  };
}

export function loadGameState(slot: SaveSlot, storage?: Storage): GameSave {
  const resolvedStorage = resolveStorage(storage);
  const keys = getSlotKeys(slot);
  return migrateGameState({
    player: parsePlayer(resolvedStorage, keys),
    inventory: parseInventory(resolvedStorage, keys),
  });
}

export function saveGameState(save: GameSave, slot: SaveSlot, storage?: Storage): void {
  const resolvedStorage = resolveStorage(storage);
  if (!resolvedStorage) return;
  const keys = getSlotKeys(slot);
  resolvedStorage.setItem(keys.player, JSON.stringify(save.player));
  resolvedStorage.setItem(keys.inventory, JSON.stringify(save.inventory));
}

export function clearGameState(slot: SaveSlot, storage?: Storage): void {
  const resolvedStorage = resolveStorage(storage);
  if (!resolvedStorage) return;
  const keys = getSlotKeys(slot);
  resolvedStorage.removeItem(keys.player);
  resolvedStorage.removeItem(keys.inventory);
}
