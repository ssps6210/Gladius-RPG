import {
  createInitialEquipment,
  createInitialPlayer,
  STORAGE_KEYS,
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

function mergePlayer(player: unknown): RuntimePlayer {
  const initialPlayer = createInitialPlayer();

  if (!isRecord(player)) {
    return initialPlayer;
  }

  const mergedPlayer: RuntimePlayer = {
    ...initialPlayer,
    equipment: mergeEquipment(player.equipment),
    monsterKills: mergeMonsterKills(player.monsterKills),
  };

  for (const [key, value] of Object.entries(player)) {
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

function parsePlayer(storage: Storage | null): RuntimePlayer {
  if (!storage) {
    return createInitialPlayer();
  }

  try {
    return mergePlayer(JSON.parse(storage.getItem(STORAGE_KEYS.player) ?? "null"));
  } catch {
    return createInitialPlayer();
  }
}

function parseInventory(storage: Storage | null): RuntimeItem[] {
  if (!storage) {
    return [];
  }

  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEYS.inventory) ?? "[]");

    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is RuntimeItem => isRecord(entry))
      : [];
  } catch {
    return [];
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

export function loadGameState(storage?: Storage): GameSave {
  const resolvedStorage = resolveStorage(storage);

  return migrateGameState({
    player: parsePlayer(resolvedStorage),
    inventory: parseInventory(resolvedStorage),
  });
}

export function saveGameState(save: GameSave, storage?: Storage): void {
  const resolvedStorage = resolveStorage(storage);

  if (!resolvedStorage) {
    return;
  }

  resolvedStorage.setItem(STORAGE_KEYS.player, JSON.stringify(save.player));
  resolvedStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(save.inventory));
}

export function clearGameState(storage?: Storage): void {
  const resolvedStorage = resolveStorage(storage);

  if (!resolvedStorage) {
    return;
  }

  resolvedStorage.removeItem(STORAGE_KEYS.player);
  resolvedStorage.removeItem(STORAGE_KEYS.inventory);
}
